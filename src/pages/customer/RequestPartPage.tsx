import { useState } from "react";
import { partRequestsApi } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
export function RequestPartPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newPartRequest, setNewPartRequest] = useState({ partName: "", description: "" });

  const submitPartRequest = async () => {
    if (!newPartRequest.partName) { setError("Enter part name"); return; }
    try {
      await partRequestsApi.submit(newPartRequest);
      setNewPartRequest({ partName: "", description: "" });
      setSuccess("Part request submitted");
    } catch {
      setError("Failed to submit request");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request a Part</h1>
        <p className="text-muted-foreground mt-1">Submit a request for an unavailable part.</p>
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
        <CardHeader><CardTitle>Request an Unavailable Part</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <div className="grid gap-1"><Label>Part Name</Label><Input value={newPartRequest.partName} onChange={(e) => setNewPartRequest({ ...newPartRequest, partName: e.target.value })} placeholder="Part you're looking for..." /></div>
          <div className="grid gap-1"><Label>Details (optional)</Label><Input value={newPartRequest.description} onChange={(e) => setNewPartRequest({ ...newPartRequest, description: e.target.value })} placeholder="Brand, model, specifications..." /></div>
          <Button onClick={submitPartRequest} className="w-full">Submit Request</Button>
        </CardContent>
      </Card>
    </div>
  );
}
