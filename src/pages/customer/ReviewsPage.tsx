import { useState, useEffect } from "react";
import { appointmentsApi, reviewsApi, AppointmentDto, ReviewDto } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
export function ReviewsPage() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [review, setReview] = useState({ appointmentId: 0, content: "", rating: 5 });
  const eligibleStatuses = new Set([
    "completed",
    "complete",
    "done",
    "fulfilled",
    "closed",
    "finished",
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [a, r] = await Promise.all([
        appointmentsApi.getMine(),
        reviewsApi.getMine(),
      ]);
      setAppointments(a.data);
      setReviews(r.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!review.appointmentId || !review.content) { setError("Select appointment and write a review"); return; }
    try {
      const res = await reviewsApi.create(review);
      setReviews([res.data, ...reviews]);
      setReview({ appointmentId: 0, content: "", rating: 5 });
      setSuccess("Review submitted");
    } catch {
      setError("Failed to submit review");
    }
  };

  const normalizeStatus = (status: string) => status.trim().toLowerCase();

  const completedAppointments = appointments.filter(
    (a) =>
      eligibleStatuses.has(normalizeStatus(a.status)) &&
      !reviews.some((r) => r.appointmentId === a.appointmentId),
  );

  const appointmentStatusSummary = appointments.length
    ? Array.from(new Set(appointments.map((a) => a.status))).join(", ")
    : "";

  if (loading) return <div className="p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground mt-1">Review completed services and see your past reviews.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700 text-sm">
          <AlertCircle className="h-4 w-4" /> {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Review a Service</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1">
              <Label>Appointment</Label>
              {completedAppointments.length === 0 ? (
                <div className="space-y-2 py-2">
                  <p className="text-sm text-muted-foreground">
                    No completed appointments to review.
                  </p>
                  {appointments.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Available appointment statuses: {appointmentStatusSummary}
                    </p>
                  )}
                </div>
              ) : (
                <Select value={review.appointmentId ? String(review.appointmentId) : ""} onValueChange={(v) => setReview({ ...review, appointmentId: parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select completed appointment..." /></SelectTrigger>
                  <SelectContent>
                    {completedAppointments.map((a) => (
                      <SelectItem key={a.appointmentId} value={String(a.appointmentId)}>
                        {a.vehicleNumber} &middot; {new Date(a.appointmentDate).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-1"><Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReview({ ...review, rating: star })}
                    className={`h-8 w-8 rounded text-sm ${star <= review.rating ? "bg-yellow-400 text-white" : "bg-gray-100"}`}>
                    {star}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-1"><Label>Review</Label><textarea className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={review.content} onChange={(e) => setReview({ ...review, content: e.target.value })} placeholder="Share your experience..." /></div>
            <Button onClick={submitReview} className="w-full">Submit Review</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>My Reviews ({reviews.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-3 border rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm">{r.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
