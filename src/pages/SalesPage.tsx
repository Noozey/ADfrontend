import { useState, useEffect } from "react";
import { partsApi, customersApi, saleInvoicesApi } from "@/api/api";
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
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Part {
  partId: number;
  name: string;
  price: number;
  stockQuantity: number;
  partNumber?: string;
}

interface Customer {
  customerId: string;
  name: string;
  email: string;
}

interface CartItem {
  partId: number;
  partName: string;
  unitPrice: number;
  quantity: number;
  stockAvailable: number;
}

interface InvoiceDetail {
  invoiceId: number;
  customerName: string;
  saleDate: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  items: {
    partName: string;
    quantity: number;
    unitPriceAtSale: number;
    lineTotal: number;
  }[];
}

export function SalesPage() {
  const { isStaff, isAdmin } = useAuth();
  const canSell = isStaff || isAdmin;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersRes, partsRes] = await Promise.all([
        customersApi.getAll(),
        partsApi.getAll(),
      ]);
      setCustomers(customersRes.data);
      setParts(partsRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadParts = async () => {
    try {
      const res = await partsApi.getAll();
      setParts(res.data);
    } catch (err) {
      console.error("Failed to reload parts", err);
    }
  };

  const addToCart = (part: Part) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.partId === part.partId);
      if (existing) {
        return prev.map((item) =>
          item.partId === part.partId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          partId: part.partId,
          partName: part.name,
          unitPrice: part.price,
          quantity: 1,
          stockAvailable: part.stockQuantity,
        },
      ];
    });
  };

  const updateQuantity = (partId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.partId === partId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (partId: number) => {
    setCart((prev) => prev.filter((item) => item.partId !== partId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      (p.partNumber &&
        p.partNumber.toLowerCase().includes(partSearch.toLowerCase())),
  );

  const handleCreateInvoice = async () => {
    setError("");
    setSuccess("");

    if (!selectedCustomerId) {
      setError("Please select a customer");
      return;
    }
    if (cart.length === 0) {
      setError("Please add at least one item to the cart");
      return;
    }

    // Validate stock
    for (const item of cart) {
      if (item.quantity > item.stockAvailable) {
        setError(
          `Insufficient stock for ${item.partName}. Available: ${item.stockAvailable}`,
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const dto = {
        customerId: selectedCustomerId,
        paymentStatus,
        dueDate: dueDate || undefined,
        items: cart.map((item) => ({
          partId: item.partId,
          quantity: item.quantity,
        })),
      };

      const res = await saleInvoicesApi.create(dto);
      setInvoice(res.data);
      setShowInvoice(true);
      setSuccess(`Invoice #${res.data.invoiceId} created successfully!`);
      setCart([]);
      setSelectedCustomerId("");
      setPaymentStatus("Paid");
      setDueDate("");
      await loadParts();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create invoice";
      setError(typeof msg === "string" ? msg : "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
        <p className="text-muted-foreground mt-1">
          Create sales invoices for customers.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 text-sm">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Customer + Parts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.customerId} value={c.customerId}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No customers found. Add customers first.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Parts browser */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Parts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parts by name or part number..."
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Part #</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.map((part) => (
                      <TableRow key={part.partId}>
                        <TableCell className="font-medium">
                          {part.name}
                        </TableCell>
                        <TableCell>{part.partNumber || "-"}</TableCell>
                        <TableCell>${part.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              part.stockQuantity < 10
                                ? "text-destructive font-semibold"
                                : ""
                            }
                          >
                            {part.stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => addToCart(part)}
                            disabled={part.stockQuantity < 1}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredParts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No parts found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Cart */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Cart is empty. Add parts from the left panel.
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.partId}
                      className="flex items-center gap-2 pb-3 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.partName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={1}
                          max={item.stockAvailable}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.partId,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-16 h-8 text-center"
                        />
                      </div>
                      <p className="text-sm font-medium w-16 text-right">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFromCart(item.partId)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {cart.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      Discount {subtotal > 5000 ? "(10% loyalty)" : ""}
                    </span>
                    <span className="text-green-600">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                  {subtotal > 5000 && (
                    <Badge variant="secondary" className="text-xs">
                      10% loyalty discount applied
                    </Badge>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="grid gap-1">
                    <label className="text-xs font-medium">Payment</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentStatus("Paid")}
                        className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                          paymentStatus === "Paid"
                            ? "bg-green-50 border-green-500 text-green-700 font-medium"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentStatus("Pending")}
                        className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                          paymentStatus === "Pending"
                            ? "bg-yellow-50 border-yellow-500 text-yellow-700 font-medium"
                            : "border-input hover:bg-accent"
                        }`}
                      >
                        Credit
                      </button>
                    </div>
                  </div>
                  {paymentStatus === "Pending" && (
                    <div className="grid gap-1">
                      <label className="text-xs font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {canSell && (
                <Button
                  className="w-full"
                  onClick={handleCreateInvoice}
                  disabled={
                    submitting || cart.length === 0 || !selectedCustomerId
                  }
                >
                  {submitting ? "Creating..." : "Create Invoice"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice detail dialog */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Invoice #{invoice?.invoiceId}
              {invoice && (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    invoice.paymentStatus === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {invoice.paymentStatus}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {invoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{invoice.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(invoice.saleDate).toLocaleString()}
                  </p>
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
                  {invoice.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.partName}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.unitPriceAtSale.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.lineTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex flex-col items-end space-y-1 text-sm">
                <div className="flex justify-between w-48">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between w-48 text-green-600">
                    <span>Discount:</span>
                    <span>-${invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-48 font-bold text-lg border-t pt-1">
                  <span>Total:</span>
                  <span>${invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
