import { useState, useEffect } from 'react';
import { partsApi } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Part {
  partId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
  partNumber?: string;
  imageUrl?: string;
}

export function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stockQuantity: '', category: 'Oil', partNumber: '', imageUrl: '' });
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      const res = await partsApi.getAll();
      setParts(res.data);
    } catch (err) {
      console.error('Failed to load parts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const partData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        category: form.category || null,
        partNumber: form.partNumber || null,
        imageUrl: form.imageUrl || null,
      };

      if (editingPart) {
        await partsApi.update(editingPart.partId, partData);
      } else {
        await partsApi.create(partData);
      }

      setShowModal(false);
      setEditingPart(null);
      setForm({ name: '', description: '', price: '', stockQuantity: '', partNumber: '', imageUrl: '' });
      loadParts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save part');
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setForm({
      name: part.name,
      description: part.description || '',
      price: part.price.toString(),
      stockQuantity: part.stockQuantity.toString(),
      category: part.category || 'Oil',
      partNumber: part.partNumber || '',
      imageUrl: part.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await partsApi.delete(id);
      loadParts();
    } catch (err) {
      console.error('Failed to delete part', err);
    }
  };

  const openCreateModal = () => {
    setEditingPart(null);
    setForm({ name: '', description: '', price: '', stockQuantity: '', category: 'Oil', partNumber: '', imageUrl: '' });
    setShowModal(true);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parts</h1>
          <p className="text-muted-foreground mt-1">Manage vehicle parts inventory.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" /> Add Part
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Description</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map(part => (
                <TableRow key={part.partId}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>{part.category || '-'}</TableCell>
                  <TableCell>{part.partNumber || '-'}</TableCell>
                  <TableCell>${part.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={part.stockQuantity < 10 ? 'text-destructive font-semibold' : ''}>
                      {part.stockQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{part.description || '-'}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(part)}>
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
                              <AlertDialogTitle>Delete Part</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{part.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(part.partId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {parts.length === 0 && <p className="p-6 text-center text-muted-foreground">No parts found.</p>}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPart ? 'Edit Part' : 'Add Part'}</DialogTitle>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input id="partNumber" value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={value => setForm(f => ({ ...f, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oil">Oil</SelectItem>
                  <SelectItem value="Filter">Filter</SelectItem>
                  <SelectItem value="Tire">Tire</SelectItem>
                  <SelectItem value="Battery">Battery</SelectItem>
                  <SelectItem value="BrakePad">BrakePad</SelectItem>
                  <SelectItem value="SparkPlug">SparkPlug</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock</Label>
                <Input id="stockQuantity" type="number" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">{editingPart ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
