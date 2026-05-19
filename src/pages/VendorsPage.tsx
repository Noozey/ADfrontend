import { useEffect, useState } from "react";
import { vendorsApi, purchaseInvoicesApi } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, History } from "lucide-react";

interface Vendor {
  vendorId: number;
  name: string;
  contactEmail?: string | null;
}

interface PurchaseItem {
  partName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface PurchaseInvoice {
  purchaseInvoiceId: number;
  vendorName: string;
  purchaseDate: string;
  totalAmount: number;
  items: PurchaseItem[];
}

const emptyForm = { name: "", contactEmail: "" };

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // Purchase history
  const [showHistory, setShowHistory] = useState(false);
  const [historyVendor, setHistoryVendor] = useState<Vendor | null>(null);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const res = await vendorsApi.getAll();
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load vendors", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingVendor(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setForm({ name: vendor.name, contactEmail: vendor.contactEmail || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      contactEmail: form.contactEmail || null,
    };
    try {
      if (editingVendor) {
        await vendorsApi.update(editingVendor.vendorId, payload);
      } else {
        await vendorsApi.create(payload);
      }
      setShowModal(false);
      setEditingVendor(null);
      setForm(emptyForm);
      loadVendors();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save vendor");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await vendorsApi.delete(id);
      loadVendors();
    } catch (err) {
      console.error("Failed to delete vendor", err);
    }
  };

  const openHistory = async (vendor: Vendor) => {
    setHistoryVendor(vendor);
    setShowHistory(true);
    setHistoryLoading(true);
    setExpandedId(null);
    try {
      const res = await purchaseInvoicesApi.getByVendor(vendor.vendorId);
      setPurchases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load purchase history", err);
      setPurchases([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">
            Manage supplier and vendor details.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" /> Add Vendor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.vendorId}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.contactEmail || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openHistory(vendor)}
                        title="Purchase History"
                      >
                        <History className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vendor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete {vendor.name}? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(vendor.vendorId)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {vendors.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">
              No vendors found.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? "Edit Vendor" : "Add Vendor"}
            </DialogTitle>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingVendor ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Purchase History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase History — {historyVendor?.name}</DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No purchases found for this vendor.
            </p>
          ) : (
            <div className="space-y-3">
              {purchases.map((p) => (
                <Card key={p.purchaseInvoiceId}>
                  <CardContent className="p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedId(
                          expandedId === p.purchaseInvoiceId
                            ? null
                            : p.purchaseInvoiceId,
                        )
                      }
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          Invoice #{p.purchaseInvoiceId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.purchaseDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${p.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.items.length} item(s)
                        </p>
                      </div>
                    </div>
                    {expandedId === p.purchaseInvoiceId && (
                      <div className="mt-3 border-t pt-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Part</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">
                                Unit Price
                              </TableHead>
                              <TableHead className="text-right">
                                Total
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {p.items.map((item, i) => (
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
