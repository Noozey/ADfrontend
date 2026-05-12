import { useState, useEffect } from "react";
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
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { reportsApi, FinancialReportResponse } from "@/api/api";

export default function FinancialReport() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Admin");

  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-10");
  const [data, setData] = useState<FinancialReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Axios automatically handles the ?start=...&end=... formatting
      const response = await reportsApi.getFinancialReport(startDate, endDate);
      setData(response.data);
    } catch (error) {
      console.error("Financial report error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchReport();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">
          Access Denied
        </h2>
        <p className="text-muted-foreground">
          You do not have the required Admin permissions to view financial
          reports.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Generate and analyze revenue data across specific dates.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <div className="grid gap-1">
            <label className="text-xs font-medium">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? "Loading..." : "Generate"}
          </Button>
        </div>
      </div>

      <hr />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{data?.totalRevenue.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              Rs.{data?.totalExpenses.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${data && data.netProfit >= 0 ? "text-green-600" : "text-destructive"}`}
            >
              Rs.{data?.netProfit.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Expense</TableHead>
                <TableHead className="text-right">Daily Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.dailyBreakdown.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-green-600">
                    Rs.{item.revenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-destructive">
                    Rs.{item.expense.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    Rs.{(item.revenue - item.expense).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {(!data || data.dailyBreakdown.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-4 text-muted-foreground"
                  >
                    No data available for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
