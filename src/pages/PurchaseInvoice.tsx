import { useState, useEffect } from "react";
import { partsApi, vendorsApi, purchaseInvoicesApi } from "@/api/api";
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
import {
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Vendor {
  vendorId: number;
  name: string;
  contactEmail?: string | null;
}

interface Part {
  partId: number;
  name: string;
  price: number;
  stockQuantity: number;
  partNumber?: string;
}

interface CartItem {
  partId: number;
  partName: string;
  unitPrice: number;
  quantity: number;
}

interface PurchaseResult {
  purchaseInvoiceId: number;
  vendorName: string;
  purchaseDate: string;
  totalAmount: number;
  items: {
    partName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

export function VendorPurchasePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(
    null,
  );
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vendorsRes, partsRes] = await Promise.all([
        vendorsApi.getAll(),
        partsApi.getAll(),
      ]);
      setVendors(Array.isArray(vendorsRes.data) ? vendorsRes.data : []);
      setParts(Array.isArray(partsRes.data) ? partsRes.data : []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (part: Part) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.partId === part.partId);
      if (existing) {
        return prev.map((i) =>
          i.partId === part.partId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          partId: part.partId,
          partName: part.name,
          unitPrice: part.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (partId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((i) => (i.partId === partId ? { ...i, quantity } : i)),
    );
  };

  const removeFromCart = (partId: number) => {
    setCart((prev) => prev.filter((i) => i.partId !== partId));
  };

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
      (p.partNumber &&
        p.partNumber.toLowerCase().includes(partSearch.toLowerCase())),
  );

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!selectedVendorId) {
      setError("Please select a vendor");
      return;
    }
    if (cart.length === 0) {
      setError("Please add at least one part");
      return;
    }

    setSubmitting(true);
    try {
      const dto = {
        vendorId: parseInt(selectedVendorId),
        items: cart.map((i) => ({
          partId: i.partId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };
      const res = await purchaseInvoicesApi.create(dto);
      setPurchaseResult(res.data);
      setShowResult(true);
      setSuccess(
        `Purchase #${res.data.purchaseInvoiceId} created. Stock updated.`,
      );
      setCart([]);
      setSelectedVendorId("");
      await loadData();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create purchase";
      setError(typeof msg === "string" ? msg : "Failed to create purchase");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Purchase from Vendor
        </h1>
        <p className="text-muted-foreground mt-1">
          Buy parts from vendors to increase stock.
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
        {/* Left: Vendor + Parts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedVendorId}
                onValueChange={setSelectedVendorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vendor..." />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.vendorId} value={String(v.vendorId)}>
                      {v.name}
                      {v.contactEmail ? ` (${v.contactEmail})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vendors.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No vendors found. Add vendors first.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Select Parts to Purchase
              </CardTitle>
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
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Current Stock</TableHead>
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
                          <Button size="sm" onClick={() => addToCart(part)}>
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

        {/* Right: Cart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Order ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No parts added yet.
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
                      <div className="w-20">
                        <Input
                          className="w-20 "
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.partId,
                              parseInt(e.target.value) || 1,
                            )
                          }
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

              {cart.length > 0 && (
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0 || !selectedVendorId}
              >
                {submitting ? "Processing..." : "Confirm Purchase"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Purchase #{purchaseResult?.purchaseInvoiceId} Confirmed
            </DialogTitle>
          </DialogHeader>
          {purchaseResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vendor</p>
                  <p className="font-medium">{purchaseResult.vendorName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(purchaseResult.purchaseDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseResult.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.partName}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.lineTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end font-bold text-lg border-t pt-2">
                <span className="mr-8">Total:</span>
                <span>${purchaseResult.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
