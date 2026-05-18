import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  customerReportsApi,
  HighSpenderReportDto,
  RegularCustomerReportDto,
  PendingCreditReportDto,
} from "@/api/api";
import { Loader2, AlertCircle, Users, TrendingUp, CreditCard } from "lucide-react";

type Tab = "high-spenders" | "regular-customers" | "pending-credits";

export default function CustomerReports() {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.roles?.some((r) => r === "Staff" || r === "Admin");

  const [activeTab, setActiveTab] = useState<Tab>("high-spenders");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [highSpenders, setHighSpenders] = useState<HighSpenderReportDto[]>([]);
  const [regularCustomers, setRegularCustomers] = useState<RegularCustomerReportDto[]>([]);
  const [pendingCredits, setPendingCredits] = useState<PendingCreditReportDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (tab: Tab) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      };
      if (tab === "high-spenders") {
        const res = await customerReportsApi.getHighSpenders(params.fromDate, params.toDate);
        setHighSpenders(res.data);
      } else if (tab === "regular-customers") {
        const res = await customerReportsApi.getRegularCustomers(params.fromDate, params.toDate);
        setRegularCustomers(res.data);
      } else {
        const res = await customerReportsApi.getPendingCredits(params.fromDate, params.toDate);
        setPendingCredits(res.data);
      }
    } catch {
      setError("Failed to load report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isStaffOrAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have the required permissions to view customer reports.
        </p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "high-spenders", label: "High Spenders", icon: <TrendingUp className="h-4 w-4" /> },
    { key: "regular-customers", label: "Regular Customers", icon: <Users className="h-4 w-4" /> },
    { key: "pending-credits", label: "Pending Credits", icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Reports</h1>
          <p className="text-muted-foreground">
            View customer insights including top spenders, frequent buyers, and pending credits.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <div className="grid gap-1">
            <label className="text-xs font-medium">From Date</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium">To Date</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={() => fetchReport(activeTab)} disabled={loading}>
            {loading ? "Loading..." : "Generate"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              fetchReport(tab.key);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === tab.key
                ? "bg-card border border-b-0 border-border text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && activeTab === "high-spenders" && (
        <Card>
          <CardHeader>
            <CardTitle>High Spenders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Last Purchase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highSpenders.map((c) => (
                  <TableRow key={c.customerId}>
                    <TableCell className="font-medium">{c.customerName}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell className="text-right">Rs.{c.totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {new Date(c.lastPurchaseDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {highSpenders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No data available for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "regular-customers" && (
        <Card>
          <CardHeader>
            <CardTitle>Regular Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Total Invoices</TableHead>
                  <TableHead className="text-right">First Purchase</TableHead>
                  <TableHead className="text-right">Last Purchase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regularCustomers.map((c) => (
                  <TableRow key={c.customerId}>
                    <TableCell className="font-medium">{c.customerName}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell className="text-right">{c.totalInvoices}</TableCell>
                    <TableCell className="text-right">
                      {new Date(c.firstPurchaseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(c.lastPurchaseDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {regularCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No data available for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!loading && activeTab === "pending-credits" && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCredits.map((c) => (
                  <TableRow key={c.invoiceId}>
                    <TableCell className="font-medium">{c.customerName}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.invoiceId}</TableCell>
                    <TableCell>{new Date(c.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(c.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">Rs.{c.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          c.paymentStatus === "Overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.daysOverdue != null ? `${c.daysOverdue}d` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {pendingCredits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No pending credits found for the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
