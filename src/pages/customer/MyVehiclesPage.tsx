import { useState, useEffect } from "react";
import { vehiclesApi, VehicleDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
export function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newVehicle, setNewVehicle] = useState({ vehicleNumber: "", make: "", model: "", mileage: 0 });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await vehiclesApi.getMine();
      setVehicles(res.data);
    } catch {
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async () => {
    try {
      const res = await vehiclesApi.create(newVehicle);
      setVehicles([...vehicles, res.data]);
      setNewVehicle({ vehicleNumber: "", make: "", model: "", mileage: 0 });
      setSuccess("Vehicle added");
    } catch {
      setError("Failed to add vehicle");
    }
  };

  const deleteVehicle = async (id: number) => {
    try {
      await vehiclesApi.delete(id);
      setVehicles(vehicles.filter((v) => v.vehicleId !== id));
    } catch {
      setError("Failed to delete vehicle");
    }
  };

  if (loading) return <div className="p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
        <p className="text-muted-foreground mt-1">Register and manage your vehicles.</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1"><Label>Vehicle Number</Label><Input value={newVehicle.vehicleNumber} onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })} placeholder="ABC-1234" /></div>
            <div className="grid gap-1"><Label>Make</Label><Input value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} placeholder="Toyota" /></div>
            <div className="grid gap-1"><Label>Model</Label><Input value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Corolla" /></div>
            <div className="grid gap-1"><Label>Mileage (km)</Label><Input type="number" value={newVehicle.mileage || ""} onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) || 0 })} /></div>
            <Button onClick={addVehicle} className="w-full">Add Vehicle</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>My Vehicles ({vehicles.length})</CardTitle></CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vehicles registered.</p>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div key={v.vehicleId} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{v.make} {v.model}</p>
                      <p className="text-sm text-muted-foreground">{v.vehicleNumber} &middot; {v.mileage.toLocaleString()} km</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteVehicle(v.vehicleId)}>Delete</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
