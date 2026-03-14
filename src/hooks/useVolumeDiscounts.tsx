import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VolumeDiscount {
  id: string;
  product_id: string;
  merchant_id: string;
  min_quantity: number;
  discount_percentage: number;
  discounted_price: number | null;
  created_at: string;
}

export interface VolumeDiscountInput {
  min_quantity: number;
  discount_percentage: number;
  discounted_price?: number;
}

export function useVolumeDiscounts(productId: string | null) {
  const [discounts, setDiscounts] = useState<VolumeDiscount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    if (!productId) {
      setDiscounts([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("volume_discounts")
        .select("*")
        .eq("product_id", productId)
        .order("min_quantity", { ascending: true });

      if (error) throw error;
      setDiscounts((data as VolumeDiscount[]) || []);
    } catch (error: any) {
      console.error("Error fetching volume discounts:", error);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  return { discounts, loading, refetch: fetchDiscounts };
}

export function useMerchantVolumeDiscounts(merchantId: string | null) {
  const [loading, setLoading] = useState(false);

  const addDiscount = async (
    productId: string,
    merchantIdParam: string,
    input: VolumeDiscountInput
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("volume_discounts")
        .insert({
          product_id: productId,
          merchant_id: merchantIdParam,
          min_quantity: input.min_quantity,
          discount_percentage: input.discount_percentage,
          discounted_price: input.discounted_price || null,
        });

      if (error) throw error;
      toast.success("Volume discount added!");
      return true;
    } catch (error: any) {
      console.error("Error adding volume discount:", error);
      toast.error("Failed to add volume discount");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = async (discountId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("volume_discounts")
        .delete()
        .eq("id", discountId);

      if (error) throw error;
      toast.success("Volume discount removed");
      return true;
    } catch (error: any) {
      console.error("Error removing volume discount:", error);
      toast.error("Failed to remove discount");
      return false;
    }
  };

  return { addDiscount, removeDiscount, loading };
}

// Calculate the best applicable discount for a given quantity
export function getApplicableDiscount(
  discounts: VolumeDiscount[],
  quantity: number,
  basePrice: number
): { discountedPrice: number; discountPercentage: number; tier: VolumeDiscount | null } {
  if (!discounts.length || quantity <= 0) {
    return { discountedPrice: basePrice, discountPercentage: 0, tier: null };
  }

  // Find the highest tier the quantity qualifies for
  const applicableTiers = discounts
    .filter((d) => quantity >= d.min_quantity)
    .sort((a, b) => b.min_quantity - a.min_quantity);

  if (applicableTiers.length === 0) {
    return { discountedPrice: basePrice, discountPercentage: 0, tier: null };
  }

  const bestTier = applicableTiers[0];
  
  if (bestTier.discounted_price !== null) {
    return {
      discountedPrice: bestTier.discounted_price,
      discountPercentage: bestTier.discount_percentage,
      tier: bestTier,
    };
  }

  const discountedPrice = basePrice * (1 - bestTier.discount_percentage / 100);
  return {
    discountedPrice: Math.round(discountedPrice),
    discountPercentage: bestTier.discount_percentage,
    tier: bestTier,
  };
}
