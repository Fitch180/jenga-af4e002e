import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface PinnedContextType {
  pinnedMerchants: string[];
  pinnedProducts: string[];
  toggleMerchantPin: (id: string) => void;
  toggleProductPin: (id: string) => void;
  isMerchantPinned: (id: string) => boolean;
  isProductPinned: (id: string) => boolean;
}

const PinnedContext = createContext<PinnedContextType | undefined>(undefined);

export const PinnedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinnedMerchants, setPinnedMerchants] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pinnedMerchants");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [pinnedProducts, setPinnedProducts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pinnedProducts");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("pinnedMerchants", JSON.stringify(pinnedMerchants));
  }, [pinnedMerchants]);

  useEffect(() => {
    localStorage.setItem("pinnedProducts", JSON.stringify(pinnedProducts));
  }, [pinnedProducts]);

  const toggleMerchantPin = (id: string) => {
    setPinnedMerchants((prev) => {
      const isPinned = prev.includes(id);
      if (isPinned) {
        toast.success("Merchant unpinned");
        return prev.filter((i) => i !== id);
      } else {
        toast.success("Merchant pinned");
        return [...prev, id];
      }
    });
  };

  const toggleProductPin = (id: string) => {
    setPinnedProducts((prev) => {
      const isPinned = prev.includes(id);
      if (isPinned) {
        toast.success("Product unpinned");
        return prev.filter((i) => i !== id);
      } else {
        toast.success("Product pinned");
        return [...prev, id];
      }
    });
  };

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
