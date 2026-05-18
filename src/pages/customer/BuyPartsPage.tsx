import { useEffect, useState } from "react";
import { partsApi, saleInvoicesApi } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Search, ShoppingCart, Trash2, XCircle } from "lucide-react";

interface Part {
  partId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
  partNumber?: string;
}

interface CartItem {
  partId: number;
  partName: string;
  unitPrice: number;
  quantity: number;
  stockAvailable: number;
}

export function BuyPartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      const res = await partsApi.getPublic();
      setParts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("You do not have permission to browse the customer parts catalog.");
      } else {
        setError(err.response?.data?.message || "Failed to load parts");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (part: Part) => {
    setCart(prev => {
      const existing = prev.find(item => item.partId === part.partId);
      if (existing) {
        return prev.map(item =>
          item.partId === part.partId
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stockAvailable) }
            : item
        );
      }
      return [...prev, {
        partId: part.partId,
        partName: part.name,
        unitPrice: part.price,
        quantity: 1,
        stockAvailable: part.stockQuantity,
      }];
    });
  };

  const updateQuantity = (partId: number, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.partId === partId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stockAvailable)) }
          : item
      )
    );
  };

  const removeFromCart = (partId: number) => {
    setCart(prev => prev.filter(item => item.partId !== partId));
  };

  const createOrder = async () => {
    setError("");
    setSuccess("");
    if (cart.length === 0) {
      setError("Add at least one part to cart");
      return;
    }

    setSubmitting(true);
    try {
      await saleInvoicesApi.createMine({
        paymentStatus: "Paid",
        items: cart.map(item => ({
          partId: item.partId,
          quantity: item.quantity,
        })),
      });
      setCart([]);
      setSuccess("Purchase created successfully.");
      loadParts();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("You do not have permission to create this purchase.");
      } else {
        setError(err.response?.data?.message || "Failed to create purchase");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(search.toLowerCase()) ||
    (part.partNumber && part.partNumber.toLowerCase().includes(search.toLowerCase())) ||
    (part.category && part.category.toLowerCase().includes(search.toLowerCase()))
  );
  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buy Parts</h1>
        <p className="text-muted-foreground mt-1">Browse available parts and create a purchase.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <XCircle className="h-4 w-4" /> {error}
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
            <CardTitle className="text-lg">Available Parts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts..." className="pl-10" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Part #</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map(part => (
                    <TableRow key={part.partId}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell>{part.category || "-"}</TableCell>
                      <TableCell>{part.partNumber || "-"}</TableCell>
                      <TableCell className="text-right">Rs.{part.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={part.stockQuantity > 0 ? "secondary" : "destructive"}>
                          {part.stockQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => addToCart(part)} disabled={part.stockQuantity < 1}>
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredParts.length === 0 && <p className="p-6 text-center text-muted-foreground">No parts found.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cart is empty.</p>
            ) : (
              cart.map(item => (
                <div key={item.partId} className="grid grid-cols-[1fr_72px_32px] items-center gap-2 border-b pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.partName}</p>
                    <p className="text-xs text-muted-foreground">Rs.{item.unitPrice.toFixed(2)} each</p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={item.stockAvailable}
                    value={item.quantity}
                    onChange={e => updateQuantity(item.partId, parseInt(e.target.value) || 1)}
                    className="h-9 text-center"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.partId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
            <div className="flex justify-between font-semibold border-t pt-3">
              <span>Total</span>
              <span>Rs.{total.toFixed(2)}</span>
            </div>
            <Button className="w-full" onClick={createOrder} disabled={submitting || cart.length === 0}>
              {submitting ? "Buying..." : "Buy Parts"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
