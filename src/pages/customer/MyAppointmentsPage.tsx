import { useState, useEffect } from "react";
import { appointmentsApi, AppointmentDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";
import { statusBadge } from "@/lib/helpers";

export function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await appointmentsApi.getMine();
      setAppointments(res.data);
    } catch {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    try {
      await appointmentsApi.cancel(id);
      setAppointments(appointments.map((a) => a.appointmentId === id ? { ...a, status: "Cancelled" } : a));
    } catch {
      setError("Failed to cancel");
    }
  };

  if (loading) return <div className="p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-1">View and manage your service appointments.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>My Appointments ({appointments.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No appointments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.appointmentId}>
                    <TableCell>{a.vehicleNumber}</TableCell>
                    <TableCell>{new Date(a.appointmentDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground">{a.description || "—"}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell>
                      {a.status === "Pending" && (
                        <Button variant="ghost" size="sm" onClick={() => cancelAppointment(a.appointmentId)}>Cancel</Button>
                      )}
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
