import { useEffect, useMemo, useState } from "react";
import { reviewsApi, ReviewDto } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2, MessageSquareText, RefreshCw, Star } from "lucide-react";

function renderStars(rating: number | null) {
  const value = Math.max(0, Math.min(5, rating ?? 0));
  return "★".repeat(value) + "☆".repeat(5 - value);
}

export default function StaffReviewsPage() {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.roles?.some((role) => role === "Staff" || role === "Admin");

  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("All");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const showSpinner = reviews.length === 0;
    if (showSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");

    try {
      const res = await reviewsApi.getAll();
      setReviews(res.data);
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        !term ||
        review.customerName.toLowerCase().includes(term) ||
        review.content.toLowerCase().includes(term) ||
        String(review.appointmentId).includes(term);

      const matchesRating =
        ratingFilter === "All" ||
        String(review.rating ?? "Unrated") === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const ratingOptions = ["All", "5", "4", "3", "2", "1", "Unrated"];

  if (!isStaffOrAdmin) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to view customer reviews.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Reviews</h1>
          <p className="mt-1 text-muted-foreground">
            View all reviews submitted by customers.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-1">
            <label className="text-xs font-medium">Search</label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Customer, content, appointment..."
              className="w-72"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {ratingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={loadReviews} disabled={refreshing}>
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquareText className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No reviews found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.customerName}
                    </TableCell>
                    <TableCell>{review.appointmentId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">
                          {review.rating ?? "Unrated"}
                        </span>
                        <Badge variant="outline" className="rounded-full">
                          {renderStars(review.rating)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xl text-muted-foreground">
                      <div className="line-clamp-3 whitespace-pre-wrap">
                        {review.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
