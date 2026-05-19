import { useState, useEffect } from "react";
import {
  saleInvoicesApi,
  customersApi,
  SaleInvoiceDto,
  CustomerDto,
} from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  FileText,
  Search,
  Eye,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function InvoicesPage() {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.roles?.some(
    (r) => r === "Staff" || r === "Admin",
  );

  const [invoices, setInvoices] = useState<SaleInvoiceDto[]>([]);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<SaleInvoiceDto | null>(
    null,
  );
  const [showDetail, setShowDetail] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [emailSentId, setEmailSentId] = useState<number | null>(null);

  useEffect(() => {
    loadInvoices();
    loadCustomers();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await saleInvoicesApi.getAll();
      setInvoices(res.data);
    } catch {
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await customersApi.getAll();
      setCustomers(res.data);
    } catch {
      // non-critical
    }
  };

  const sendEmail = async (id: number) => {
    setSendingId(id);
    setError(null);
    try {
      await saleInvoicesApi.sendEmail(id);
      setEmailSentId(id);
      setTimeout(() => setEmailSentId(null), 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Failed to send email.",
      );
    } finally {
      setSendingId(null);
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

  const filtered =
    selectedCustomerId || fromDate || toDate
      ? invoices.filter((inv) => {
          if (selectedCustomerId && inv.customerId !== selectedCustomerId)
            return false;
          if (fromDate && new Date(inv.saleDate) < new Date(fromDate))
            return false;
          if (toDate && new Date(inv.saleDate) > new Date(toDate + "T23:59:59"))
            return false;
          return true;
        })
      : invoices;

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

  if (!isStaffOrAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          You do not have permission to view invoices.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground mt-1">
          View and search all sales invoices.
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
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <label className="text-xs font-medium">Customer</label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">All customers</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.customerId} value={c.customerId}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium">From</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium">To</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCustomerId("");
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No invoices found.</p>
            </div>
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
                {filtered.map((inv) => (
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => sendEmail(inv.invoiceId)}
                        disabled={sendingId === inv.invoiceId}
                      >
                        {sendingId === inv.invoiceId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : emailSentId === inv.invoiceId ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
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

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() =>
                    selectedInvoice && sendEmail(selectedInvoice.invoiceId)
                  }
                  disabled={sendingId === selectedInvoice?.invoiceId}
                >
                  {sendingId === selectedInvoice?.invoiceId ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Mail className="h-4 w-4 mr-1" />
                  )}
                  {sendingId === selectedInvoice?.invoiceId
                    ? "Sending..."
                    : "Email Invoice"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
