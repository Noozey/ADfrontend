import { useEffect, useState } from "react";
import { saleInvoicesApi, SaleInvoiceDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, FileText } from "lucide-react";

export function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<SaleInvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const res = await saleInvoicesApi.getMine();
      setInvoices(res.data);
    } catch {
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Paid: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Overdue: "bg-red-100 text-red-700",
    };
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
        <p className="text-muted-foreground mt-1">View your part purchase invoices.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">No invoices found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow key={invoice.invoiceId}>
                    <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                    <TableCell>{new Date(invoice.saleDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">Rs.{invoice.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>{statusBadge(invoice.paymentStatus)}</TableCell>
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
