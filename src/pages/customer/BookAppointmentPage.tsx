import { useState, useEffect } from "react";
import { vehiclesApi, appointmentsApi, VehicleDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, CalendarPlus, Car, CheckCircle } from "lucide-react";
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
    setError("");
    setSuccess("");
    if (!booking.vehicleId || !booking.appointmentDate) {
      setError("Select a vehicle and date");
      return;
    }
    try {
      await appointmentsApi.book(booking);
      setBooking({ vehicleId: 0, appointmentDate: "", description: "" });
      setSuccess("Appointment booked");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to book appointment");
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
          <CheckCircle className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Vehicle</Label>
              <Select value={booking.vehicleId ? String(booking.vehicleId) : ""} onValueChange={(v) => setBooking({ ...booking, vehicleId: parseInt(v) })}>
                <SelectTrigger>
                  <SelectValue placeholder={vehicles.length ? "Select vehicle..." : "Add a vehicle first"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.vehicleId} value={String(v.vehicleId)}>
                      {v.make} {v.model} ({v.vehicleNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={booking.appointmentDate} onChange={(e) => setBooking({ ...booking, appointmentDate: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <textarea
                value={booking.description}
                onChange={(e) => setBooking({ ...booking, description: e.target.value })}
                placeholder="Oil change, brake service, inspection..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={bookAppointment} disabled={vehicles.length === 0}>
                Book Appointment
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vehicles registered yet.</p>
            ) : (
              vehicles.map(vehicle => (
                <div key={vehicle.vehicleId} className="rounded-md border border-input p-3">
                  <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.vehicleNumber}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.mileage.toLocaleString()} km</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
