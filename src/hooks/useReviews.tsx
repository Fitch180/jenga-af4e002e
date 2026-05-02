import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Review {
  id: string;
  merchant_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  review_text: string | null;
  merchant_response: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { first_name: string; last_name: string | null } | null;
}

export interface MerchantRatingStats {
  averageRating: number;
  totalReviews: number;
}

export const useReviews = (merchantId?: string) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MerchantRatingStats>({ averageRating: 0, totalReviews: 0 });

  const fetchReviews = useCallback(async () => {
    if (!merchantId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("merchant_reviews")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
      return;
    }

    // Fetch profile names for reviewers
    const userIds = [...new Set((data || []).map(r => r.user_id))];
    let profilesMap: Record<string, { first_name: string; last_name: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", userIds);

      if (profiles) {
        profilesMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      }
    }

    const reviewsWithProfiles = (data || []).map(r => ({
      ...r,
      profiles: profilesMap[r.user_id] || null,
    }));

    setReviews(reviewsWithProfiles);

    // Calculate stats
    if (reviewsWithProfiles.length > 0) {
      const avg = reviewsWithProfiles.reduce((sum, r) => sum + r.rating, 0) / reviewsWithProfiles.length;
      setStats({ averageRating: Math.round(avg * 10) / 10, totalReviews: reviewsWithProfiles.length });
    } else {
      setStats({ averageRating: 0, totalReviews: 0 });
    }

    setLoading(false);
  }, [merchantId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (orderId: string, rating: number, reviewText: string, photoUrls?: string[]) => {
    if (!user || !merchantId) {
      toast.error("Please log in to submit a review");
      return false;
    }

    const { error } = await supabase
      .from("merchant_reviews")
      .insert({
        merchant_id: merchantId,
        user_id: user.id,
        order_id: orderId,
        rating,
        review_text: reviewText.trim() || null,
        photo_urls: photoUrls && photoUrls.length > 0 ? photoUrls : [],
      } as any);

    if (error) {
      if (error.code === "23505") {
        toast.error("You have already reviewed this order");
      } else {
        console.error("Error submitting review:", error);
        toast.error("Failed to submit review");
      }
      return false;
    }

    toast.success("Review submitted successfully!");
    await fetchReviews();
    return true;
  };

  const hasReviewedOrder = (orderId: string) => {
    return reviews.some(r => r.order_id === orderId && r.user_id === user?.id);
  };

  return { reviews, stats, loading, submitReview, hasReviewedOrder, fetchReviews };
};
