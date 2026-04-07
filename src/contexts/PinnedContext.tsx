import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PinnedContextType {
  pinnedMerchants: string[];
  pinnedProducts: string[];
  toggleMerchantPin: (id: string) => void;
  toggleProductPin: (id: string) => void;
  isMerchantPinned: (id: string) => boolean;
  isProductPinned: (id: string) => boolean;
  loading: boolean;
}

const PinnedContext = createContext<PinnedContextType | undefined>(undefined);

export const PinnedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinnedMerchants, setPinnedMerchants] = useState<string[]>([]);
  const [pinnedProducts, setPinnedProducts] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load pinned items from DB when user changes
  useEffect(() => {
    if (!userId) {
      setPinnedMerchants([]);
      setPinnedProducts([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pinned_items")
        .select("item_type, item_id")
        .eq("user_id", userId);

      if (error) {
        console.error("Error loading pinned items:", error);
        setLoading(false);
        return;
      }

      setPinnedMerchants(data.filter(i => i.item_type === "merchant").map(i => i.item_id));
      setPinnedProducts(data.filter(i => i.item_type === "product").map(i => i.item_id));
      setLoading(false);
    };

    load();
  }, [userId]);

  const togglePin = useCallback(async (itemType: "merchant" | "product", id: string) => {
    if (!userId) {
      toast.error("Please log in to pin items");
      return;
    }

    const setter = itemType === "merchant" ? setPinnedMerchants : setPinnedProducts;
    const isPinned = itemType === "merchant" ? pinnedMerchants.includes(id) : pinnedProducts.includes(id);

    if (isPinned) {
      setter(prev => prev.filter(i => i !== id));
      const { error } = await supabase
        .from("pinned_items")
        .delete()
        .eq("user_id", userId)
        .eq("item_type", itemType)
        .eq("item_id", id);

      if (error) {
        setter(prev => [...prev, id]); // revert
        console.error("Error unpinning:", error);
      } else {
        toast.success(`${itemType === "merchant" ? "Merchant" : "Product"} unpinned`);
      }
    } else {
      setter(prev => [...prev, id]);
      const { error } = await supabase
        .from("pinned_items")
        .insert({ user_id: userId, item_type: itemType, item_id: id });

      if (error) {
        setter(prev => prev.filter(i => i !== id)); // revert
        console.error("Error pinning:", error);
      } else {
        toast.success(`${itemType === "merchant" ? "Merchant" : "Product"} pinned`);
      }
    }
  }, [userId, pinnedMerchants, pinnedProducts]);

  const toggleMerchantPin = (id: string) => togglePin("merchant", id);
  const toggleProductPin = (id: string) => togglePin("product", id);
  const isMerchantPinned = (id: string) => pinnedMerchants.includes(id);
  const isProductPinned = (id: string) => pinnedProducts.includes(id);

  return (
    <PinnedContext.Provider
      value={{
        pinnedMerchants,
        pinnedProducts,
        toggleMerchantPin,
        toggleProductPin,
        isMerchantPinned,
        isProductPinned,
        loading,
      }}
    >
      {children}
    </PinnedContext.Provider>
  );
};

export const usePinned = () => {
  const context = useContext(PinnedContext);
  if (!context) {
    throw new Error("usePinned must be used within PinnedProvider");
  }
  return context;
};
