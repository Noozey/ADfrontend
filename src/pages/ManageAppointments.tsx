import { useState, useEffect } from "react";
import { appointmentsApi, AppointmentDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Calendar } from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Confirmed", "InProgress", "Completed", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  InProgress: "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.getAll();
      setAppointments(res.data);
    } catch {
      setError("Failed to load appointments.");
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Appointments</h1>
          <p className="text-muted-foreground mt-1">View and update appointment statuses.</p>
        </div>
        <Button variant="outline" onClick={loadAppointments} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No appointments found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.appointmentId}>
                    <TableCell className="font-medium">{a.appointmentId}</TableCell>
                    <TableCell>{a.customerName}</TableCell>
                    <TableCell>{a.vehicleNumber}</TableCell>
                    <TableCell>{new Date(a.appointmentDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground max-w-40 truncate">{a.description || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[a.status] || ""}`}>
                        {a.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value=""
                        onValueChange={(val) => updateStatus(a.appointmentId, val)}
                      >
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
