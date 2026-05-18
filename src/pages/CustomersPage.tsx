import { useEffect, useState } from 'react';
import { customersApi, vehiclesApi } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserRound, Car, History, XCircle } from 'lucide-react';

interface Customer {
  customerId: string;
  id?: string | number;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
}

interface Vehicle {
  vehicleId?: number;
  id?: number;
  vehicleNumber?: string;
  registrationNumber?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
}

interface HistoryItem {
  id?: number;
  historyId?: number;
  invoiceId?: number;
  serviceId?: number;
  type?: string;
  date?: string;
  saleDate?: string;
  serviceDate?: string;
  purchaseDate?: string;
  description?: string;
  partName?: string;
  vehicleNumber?: string;
  totalAmount?: number;
  amount?: number;
  status?: string;
}

interface CustomerOverview {
  totalPurchases?: number;
  totalServices?: number;
  totalSpent?: number;
  lastVisit?: string;
  vehicleCount?: number;
}

export function CustomersPage() {
  const [term, setTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [overview, setOverview] = useState<CustomerOverview | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const getCustomerId = (customer: Customer) => customer.customerId || customer.id?.toString() || '';
  const getCustomerName = (customer: Customer) => customer.name || customer.fullName || 'Unknown customer';
  const getCustomerPhone = (customer: Customer) => customer.phoneNumber || customer.phone || '-';

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const formatMoney = (value?: number) => {
    if (typeof value !== 'number') return '-';
    return `$${value.toFixed(2)}`;
  };

  const loadCustomers = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await customersApi.getAll();
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSelectedCustomer(null);
    setOverview(null);
    setVehicles([]);
    setHistory([]);

    if (!term.trim()) {
      loadCustomers();
      return;
    }

    setLoading(true);
    try {
      const res = await customersApi.search(term.trim());
      setCustomers(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err: any) {
      setCustomers([]);
      setError(err.response?.data?.message || 'Failed to search customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (customer: Customer) => {
    const customerId = getCustomerId(customer);
    if (!customerId) return;

    setError('');
    setDetailsLoading(true);
    try {
      const [customerRes, overviewRes, historyRes, vehiclesRes] = await Promise.all([
        customersApi.getById(customerId),
        customersApi.getOverview(customerId),
        customersApi.getHistory(customerId),
        vehiclesApi.getByCustomer(customerId),
      ]);

      setSelectedCustomer(customerRes.data);
      setOverview(overviewRes.data);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground mt-1">Search customers and review their vehicles, purchases, and service history.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={term}
                onChange={e => setTerm(e.target.value)}
                placeholder="Search by name, phone, vehicle number, or customer ID..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customers.map(customer => (
              <button
                key={getCustomerId(customer)}
                type="button"
                onClick={() => loadCustomerDetails(customer)}
                className="w-full text-left rounded-md border border-input p-3 hover:bg-accent transition"
              >
                <p className="font-medium">{getCustomerName(customer)}</p>
                <p className="text-sm text-muted-foreground">{customer.email || '-'}</p>
                <p className="text-sm text-muted-foreground">{getCustomerPhone(customer)}</p>
              </button>
            ))}
            {customers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading customers...' : 'No customers found.'}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detailsLoading ? (
                <p className="text-sm text-muted-foreground">Loading customer details...</p>
              ) : selectedCustomer ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{getCustomerName(selectedCustomer)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium">{getCustomerId(selectedCustomer)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedCustomer.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{getCustomerPhone(selectedCustomer)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedCustomer.address || '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a customer to view details.</p>
              )}
            </CardContent>
          </Card>

          {selectedCustomer && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{overview?.totalPurchases ?? '-'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{overview?.totalServices ?? '-'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatMoney(overview?.totalSpent)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Last Visit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{formatDate(overview?.lastVisit)}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle Number</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Color</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map(vehicle => (
                    <TableRow key={vehicle.vehicleId || vehicle.id || vehicle.vehicleNumber}>
                      <TableCell className="font-medium">{vehicle.vehicleNumber || vehicle.registrationNumber || '-'}</TableCell>
                      <TableCell>{vehicle.make || '-'}</TableCell>
                      <TableCell>{vehicle.model || '-'}</TableCell>
                      <TableCell>{vehicle.year || '-'}</TableCell>
                      <TableCell>{vehicle.color || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {vehicles.length === 0 && <p className="p-6 text-center text-muted-foreground">No vehicles found.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Purchase & Service History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(item => {
                    const itemDate = item.date || item.saleDate || item.serviceDate || item.purchaseDate;
                    const amount = item.totalAmount ?? item.amount;

                    return (
                      <TableRow key={item.historyId || item.invoiceId || item.serviceId || item.id || `${itemDate}-${item.description}`}>
                        <TableCell>{formatDate(itemDate)}</TableCell>
                        <TableCell>
                          <Badge variant={item.type === 'Service' ? 'default' : 'secondary'}>
                            {item.type || (item.serviceId ? 'Service' : 'Purchase')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[320px] truncate">{item.description || item.partName || '-'}</TableCell>
                        <TableCell>{item.vehicleNumber || '-'}</TableCell>
                        <TableCell className="text-right">{formatMoney(amount)}</TableCell>
                        <TableCell>{item.status || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {history.length === 0 && <p className="p-6 text-center text-muted-foreground">No purchase or service history found.</p>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
