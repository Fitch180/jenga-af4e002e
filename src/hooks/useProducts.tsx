import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string;
  image_url: string | null;
  image_urls: string[];
  stock: number;
  unit: string;
  is_active: boolean;
  item_type: 'product' | 'service';
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price?: number | null;
  category: string;
  image_url?: string;
  image_urls?: string[];
  stock?: number;
  unit?: string;
  is_active?: boolean;
  item_type?: 'product' | 'service';
}

export const useProducts = (merchantProfileId: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!merchantProfileId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("merchant_id", merchantProfileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []).map(p => ({
        ...p,
        item_type: p.item_type as 'product' | 'service',
        image_urls: p.image_urls || [],
      })));
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [merchantProfileId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: ProductFormData): Promise<boolean> => {
    if (!merchantProfileId) {
      toast.error("Merchant profile not found");
      return false;
    }

    try {
      const { error } = await supabase.from("products").insert({
        merchant_id: merchantProfileId,
        name: productData.name,
        description: productData.description || null,
        price: productData.price ?? null,
        category: productData.category,
        image_url: productData.image_url || null,
        image_urls: productData.image_urls || [],
        stock: productData.stock ?? 0,
        unit: productData.unit || "item",
        is_active: productData.is_active ?? true,
        item_type: productData.item_type || "product",
      });

      if (error) throw error;

      toast.success("Product added successfully");
      await fetchProducts();
      return true;
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product");
      return false;
    }
  };

  const updateProduct = async (
    productId: string,
    productData: Partial<ProductFormData>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image_url: productData.image_url,
          image_urls: productData.image_urls,
          stock: productData.stock,
          unit: productData.unit,
          is_active: productData.is_active,
          item_type: productData.item_type,
        })
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product updated successfully");
      await fetchProducts();
      return true;
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product deleted successfully");
      await fetchProducts();
      return true;
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
      return false;
    }
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
};
