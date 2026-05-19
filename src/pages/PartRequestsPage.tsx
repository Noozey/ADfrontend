import { useEffect, useState } from "react";
import { partRequestsApi, PartRequestDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertCircle, ClipboardList, RefreshCw } from "lucide-react";
import { statusBadge } from "@/lib/helpers";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"] as const;

export default function PartRequestsPage() {
  const [requests, setRequests] = useState<PartRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    const shouldShowSpinner = requests.length === 0;
    if (shouldShowSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");

    try {
      const res = await partRequestsApi.getAll(
        statusFilter === "All" ? undefined : statusFilter,
      );
      setRequests(res.data);
    } catch {
      setError("Failed to load part requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateRequest = async (id: number, status: string) => {
    setUpdatingId(id);
    setError("");
    try {
      let updated: PartRequestDto;
      if (status === "Approved") {
        updated = (await partRequestsApi.approve(id)).data;
      } else if (status === "Rejected") {
        updated = (await partRequestsApi.reject(id)).data;
      } else {
        updated = (await partRequestsApi.updateStatus(id, status)).data;
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === id ? updated : request,
        ),
      );
    } catch {
      setError(`Failed to update request status to ${status}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Part Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review customer part requests and change their status.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="grid gap-1">
            <label className="text-xs font-medium">Status Filter</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={loadRequests} disabled={refreshing}>
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Customer Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No part requests available.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Part Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.customerName}
                    </TableCell>
                    <TableCell>{request.partName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.description || "—"}
                    </TableCell>
                    <TableCell>{statusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={request.status}
                        onValueChange={(value) => updateRequest(request.id, value)}
                        disabled={updatingId === request.id}
                      >
                        <SelectTrigger className="w-40 ml-auto">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
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
