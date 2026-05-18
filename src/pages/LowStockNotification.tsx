import { useEffect, useState } from "react";
import { partsApi } from "../api/api.ts"; // adjust path if different
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LowStockNotifications() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await partsApi.getAll();
        const lowStock = res.data.filter((p) => p.stockQuantity < 10);
        setParts(lowStock);
      } catch (err) {
        setError("Failed to fetch parts.");
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Low Stock Notifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Parts with stock quantity below 10.
        </p>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}
      {!loading && !error && parts.length === 0 && (
        <p className="text-muted-foreground">No low stock parts.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parts.map((part) => (
          <Card key={part.partId}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {part.partNumber ?? "No Part Number"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-semibold">{part.name}</p>
              {part.category && (
                <Badge variant="secondary">{part.category}</Badge>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="destructive">Stock: {part.stockQuantity}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
