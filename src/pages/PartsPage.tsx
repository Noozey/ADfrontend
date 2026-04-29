import { useState, useEffect } from 'react';
import { partsApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

interface Part {
  partId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category: string;
  partNumber?: string;
  imageUrl?: string;
}

export function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: 'Oil',
    partNumber: '',
    imageUrl: ''
  });
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
    try {
      const partData = {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        category: form.category
      };

      if (editingPart) {
        await partsApi.update(editingPart.partId, partData);
      } else {
        await partsApi.create(partData);
      }

      setShowModal(false);
      setEditingPart(null);
      setForm({ name: '', description: '', price: '', stockQuantity: '', category: 'Oil', partNumber: '', imageUrl: '' });
      loadParts();
    } catch (err) {
      console.error('Failed to save part', err);
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setForm({
      name: part.name,
      description: part.description || '',
      price: part.price.toString(),
      stockQuantity: part.stockQuantity.toString(),
      category: part.category,
      partNumber: part.partNumber || '',
      imageUrl: part.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this part?')) return;
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

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Parts</h1>
        {isAdmin && <button className="btn-primary" onClick={openCreateModal}>Add Part</button>}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Part Number</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {parts.map(part => (
            <tr key={part.partId}>
              <td>{part.name}</td>
              <td>{part.partNumber || '-'}</td>
              <td>{part.category}</td>
              <td>${part.price.toFixed(2)}</td>
              <td>{part.stockQuantity}</td>
              {isAdmin && (
                <td>
                  <button className="btn-small" onClick={() => handleEdit(part)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => handleDelete(part.partId)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {parts.length === 0 && <p>No parts found.</p>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingPart ? 'Edit Part' : 'Add Part'}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Part Number"
                value={form.partNumber}
                onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))}
              />
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="Oil">Oil</option>
                <option value="Filter">Filter</option>
                <option value="Tire">Tire</option>
                <option value="Battery">Battery</option>
                <option value="BrakePad">BrakePad</option>
                <option value="SparkPlug">SparkPlug</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                step="0.01"
                required
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={form.stockQuantity}
                onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">{editingPart ? 'Update' : 'Create'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}