import { Star, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Review } from "@/hooks/useReviews";

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
}

export const StarRating = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size} ${
          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

export const ReviewsList = ({ reviews, loading }: ReviewsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="text-muted-foreground text-center py-4">No reviews yet</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const name = review.profiles
          ? `${review.profiles.first_name}${review.profiles.last_name ? " " + review.profiles.last_name.charAt(0) + "." : ""}`
          : "Anonymous";

        const photoUrls = (review as any).photo_urls as string[] | null;

        return (
          <Card key={review.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.review_text && (
              <p className="text-sm text-foreground leading-relaxed">{review.review_text}</p>
            )}
            {/* Review Photos */}
            {photoUrls && photoUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photoUrls.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt="Review" className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
            {review.merchant_response && (
              <div className="bg-muted/50 rounded-lg p-3 mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Merchant Response</p>
                <p className="text-sm text-foreground">{review.merchant_response}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
