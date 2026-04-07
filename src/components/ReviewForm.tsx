import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface ReviewFormProps {
  onSubmit: (rating: number, reviewText: string) => Promise<boolean>;
}

export const ReviewForm = ({ onSubmit }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    const success = await onSubmit(rating, reviewText);
    if (success) {
      setRating(0);
      setReviewText("");
    }
    setSubmitting(false);
  };

  return (
    <Card className="p-4 space-y-3">
      <h4 className="font-semibold text-foreground">Leave a Review</h4>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Share your experience (optional)"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
        rows={3}
        className="resize-none"
      />
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </Card>
  );
};
