import { useState, useEffect } from "react";
import { vehiclesApi, appointmentsApi, VehicleDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
export function BookAppointmentPage() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [booking, setBooking] = useState({ vehicleId: 0, appointmentDate: "", description: "" });

  useEffect(() => {
    (async () => {
      try {
        const res = await vehiclesApi.getMine();
        setVehicles(res.data);
      } catch {
        setError("Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const bookAppointment = async () => {
    if (!booking.vehicleId || !booking.appointmentDate) {
      setError("Select a vehicle and date");
      return;
    }
    try {
      await appointmentsApi.book(booking);
      setBooking({ vehicleId: 0, appointmentDate: "", description: "" });
      setSuccess("Appointment booked");
    } catch {
      setError("Failed to book appointment");
    }
  };

  if (loading) return <div className="p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book Appointment</h1>
        <p className="text-muted-foreground mt-1">Schedule a service appointment for your vehicle.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 text-sm">
          <AlertCircle className="h-4 w-4" /> {success}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Book an Appointment</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <div className="grid gap-1">
            <Label>Vehicle</Label>
            <Select value={booking.vehicleId ? String(booking.vehicleId) : ""} onValueChange={(v) => setBooking({ ...booking, vehicleId: parseInt(v) })}>
              <SelectTrigger><SelectValue placeholder="Select vehicle..." /></SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.vehicleId} value={String(v.vehicleId)}>{v.make} {v.model} ({v.vehicleNumber})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1"><Label>Date & Time</Label><Input type="datetime-local" value={booking.appointmentDate} onChange={(e) => setBooking({ ...booking, appointmentDate: e.target.value })} /></div>
          <div className="grid gap-1"><Label>Description (optional)</Label><Input value={booking.description} onChange={(e) => setBooking({ ...booking, description: e.target.value })} placeholder="Oil change, brake service..." /></div>
          <Button onClick={bookAppointment} className="w-full">Book Appointment</Button>
        </CardContent>
      </Card>
    </div>
  );
}
