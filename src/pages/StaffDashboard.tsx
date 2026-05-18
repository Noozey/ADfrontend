import { useState, useEffect } from "react";
import { appointmentsApi, partRequestsApi, saleInvoicesApi, AppointmentDto, PartRequestDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Package, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { statusBadge } from "@/lib/helpers";

const STATUS_OPTIONS = ["Pending", "Confirmed", "InProgress", "Completed", "Cancelled"];

export default function StaffDashboard({ userInfo }: { userInfo: React.ReactNode }) {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PartRequestDto[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [apptRes, partsRes, invRes] = await Promise.all([
        appointmentsApi.getAll(),
        partRequestsApi.getAll(),
        saleInvoicesApi.getAll(),
      ]);
      setAppointments(apptRes.data);
      setPendingRequests(partsRes.data.filter((r) => r.status === "Pending"));
      setInvoiceCount(invRes.data.length);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await appointmentsApi.updateStatus(id, status);
      setAppointments(appointments.map((a) => (a.appointmentId === id ? res.data : a)));
    } catch {
      setError("Failed to update status.");
    }
  };

  const todayAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate).toDateString() === new Date().toDateString()
  );
  const recentAppointments = appointments.slice(0, 5);

  if (loading) return <div className="p-6 flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of today's activity.</p>
      </div>

      {userInfo}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayAppointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoiceCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Appointments</CardTitle>
            <Link to="/appointments">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentAppointments.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No appointments yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAppointments.map((a) => (
                    <TableRow key={a.appointmentId}>
                      <TableCell className="font-medium">{a.customerName}</TableCell>
                      <TableCell>{new Date(a.appointmentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg">Pending Part Requests</CardTitle>
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {pendingRequests.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.slice(0, 5).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.customerName}</TableCell>
                      <TableCell>{r.partName}</TableCell>
                      <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Status Update</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No appointments to manage.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.slice(0, 5).map((a) => (
                  <TableRow key={a.appointmentId}>
                    <TableCell className="font-medium">{a.appointmentId}</TableCell>
                    <TableCell>{a.customerName}</TableCell>
                    <TableCell>{a.vehicleNumber}</TableCell>
                    <TableCell>{new Date(a.appointmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell className="text-right">
                      <Select value="" onValueChange={(val) => updateStatus(a.appointmentId, val)}>
                        <SelectTrigger className="w-36 ml-auto">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.filter((s) => s !== a.status).map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === "InProgress" ? "In Progress" : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
