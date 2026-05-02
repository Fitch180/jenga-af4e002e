import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_adjustment: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VariantFormData {
  variant_type: string;
  variant_value: string;
  price_adjustment?: number;
  stock?: number;
  is_active?: boolean;
}

export const useProductVariants = (productId: string | null) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVariants = useCallback(async () => {
    if (!productId) { setVariants([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("variant_type", { ascending: true });

    if (error) console.error("Error fetching variants:", error);
    else setVariants((data as ProductVariant[]) || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  const addVariant = async (data: VariantFormData): Promise<boolean> => {
    if (!productId) return false;
    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      variant_type: data.variant_type,
      variant_value: data.variant_value,
      price_adjustment: data.price_adjustment || 0,
      stock: data.stock || 0,
      is_active: data.is_active ?? true,
    });
    if (error) { toast.error("Failed to add variant"); return false; }
    toast.success("Variant added");
    await fetchVariants();
    return true;
  };

  const deleteVariant = async (variantId: string): Promise<boolean> => {
    const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
    if (error) { toast.error("Failed to delete variant"); return false; }
    toast.success("Variant removed");
    await fetchVariants();
    return true;
  };

  // Group variants by type
  const groupedVariants = variants.reduce((acc, v) => {
    if (!acc[v.variant_type]) acc[v.variant_type] = [];
    acc[v.variant_type].push(v);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  return { variants, groupedVariants, loading, addVariant, deleteVariant, refetch: fetchVariants };
};
