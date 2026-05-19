import { useEffect, useState } from "react";
import { saleInvoicesApi, SaleInvoiceDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Eye, Loader2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<SaleInvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoiceDto | null>(
    null,
  );

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

  const viewInvoice = async (id: number) => {
    try {
      const res = await saleInvoicesApi.getById(id);
      setSelectedInvoice(res.data);
      setShowDetail(true);
    } catch {
      setError("Failed to load invoice details.");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Paid: "bg-green-100 text-green-700",
      Pending: "bg-yellow-100 text-yellow-700",
      Overdue: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
        <p className="text-muted-foreground mt-1">
          View your part purchase invoices.
        </p>
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
            <p className="p-6 text-center text-muted-foreground">
              No invoices found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.invoiceId}>
                    <TableCell className="font-medium">
                      {inv.invoiceId}
                    </TableCell>
                    <TableCell>{inv.customerName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {inv.staffName}
                    </TableCell>
                    <TableCell>
                      {new Date(inv.saleDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs.{inv.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{statusBadge(inv.paymentStatus)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewInvoice(inv.invoiceId)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice #{selectedInvoice?.invoiceId}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Staff</p>
                  <p className="font-medium">{selectedInvoice.staffName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.saleDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <p>{statusBadge(selectedInvoice.paymentStatus)}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item) => (
                    <TableRow key={item.itemId}>
                      <TableCell>{item.partName}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs.{item.unitPriceAtSale.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs.{item.lineTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-end space-y-1 text-sm">
                <div className="flex justify-between w-48">
                  <span>Subtotal:</span>
                  <span>Rs.{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between w-48 text-green-600">
                    <span>Discount:</span>
                    <span>-Rs.{selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 font-bold text-lg border-t pt-1">
                  <span>Total:</span>
                  <span>Rs.{selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
