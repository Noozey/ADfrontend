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
import { reportsApi, FinancialReportResponse } from "@/api/api";

type ReportType = "daily" | "monthly" | "yearly";

export default function FinancialReport() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Admin");

  const [reportType, setReportType] = useState<ReportType>("daily");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState<FinancialReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (reportType === "daily") response = await reportsApi.getDaily(date);
      else if (reportType === "monthly")
        response = await reportsApi.getMonthly(year, month);
      else response = await reportsApi.getYearly(year);
      setData(response.data);
    } catch (err) {
      console.error("Financial report error:", err);
      setError("Failed to load report.");
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

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Reports
          </h1>
          <p className="text-muted-foreground">
            Generate daily, monthly, or yearly financial summaries.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          {/* Report type tabs */}
          <div className="flex gap-1 border rounded-md p-1 w-fit">
            {(["daily", "monthly", "yearly"] as ReportType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setReportType(t);
                  setData(null);
                }}
                className={`px-3 py-1 text-sm rounded capitalize transition-colors ${
                  reportType === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Dynamic inputs */}
          <div className="flex items-end gap-2">
            {reportType === "daily" && (
              <div className="grid gap-1">
                <label className="text-xs font-medium">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-40"
                />
              </div>
            )}

            {reportType === "monthly" && (
              <>
                <div className="grid gap-1">
                  <label className="text-xs font-medium">Year</label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-24"
                    min={2000}
                    max={2100}
                  />
                </div>
                <div className="grid gap-1">
                  <label className="text-xs font-medium">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {reportType === "yearly" && (
              <div className="grid gap-1">
                <label className="text-xs font-medium">Year</label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-24"
                  min={2000}
                  max={2100}
                />
              </div>
            )}

            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Loading..." : "Generate"}
            </Button>
          </div>
        </div>
      </div>

      <hr />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{data?.totalRevenue.toFixed(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              Rs.{data?.totalExpenses.toFixed(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data && data.netProfit >= 0
                  ? "text-green-600"
                  : "text-destructive"
              }`}
            >
              Rs.{data?.netProfit.toFixed(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Table */}
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
