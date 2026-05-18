import { useState } from 'react';
import { customersApi } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Car, CheckCircle, XCircle } from 'lucide-react';

export function CustomerRegistrationPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    vehicleNumber: '',
    make: '',
    model: '',
    mileage: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setForm({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      vehicleNumber: '',
      make: '',
      model: '',
      mileage: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email || null,
        phone: form.phone,
        address: form.address || null,
        password: form.password,
        vehicle: {
          vehicleNumber: form.vehicleNumber,
          make: form.make,
          model: form.model,
          mileage: form.mileage ? parseInt(form.mileage) : 0,
        },
      };

      await customersApi.registerWithVehicle(payload);
      setSuccess('Customer and vehicle registered successfully.');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register Customer</h1>
        <p className="text-muted-foreground mt-1">Create a customer record with their vehicle details.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input id="vehicleNumber" value={form.vehicleNumber} onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" type="number" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} required />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
