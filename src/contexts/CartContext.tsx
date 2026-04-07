import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  priceDisplay: string;
  image: string;
  merchant: string;
  merchantId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load cart from DB
  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading cart:", error);
        setLoading(false);
        return;
      }

      setItems(data.map(row => ({
        id: row.id,
        productId: row.product_id,
        name: row.name,
        price: Number(row.price),
        priceDisplay: `${Number(row.price).toLocaleString()} Tsh`,
        image: row.image || "",
        merchant: row.merchant_name,
        merchantId: row.merchant_id,
        quantity: row.quantity,
      })));
      setLoading(false);
    };

    load();
  }, [userId]);

  const addToCart = useCallback(async (product: Omit<CartItem, "quantity">) => {
    if (!userId) {
      toast.error("Please log in to add items to cart");
      return;
    }

    const existing = items.find(item => item.productId === product.productId);
    if (existing) {
      const newQty = existing.quantity + 1;
      setItems(prev => prev.map(item =>
        item.productId === product.productId ? { ...item, quantity: newQty } : item
      ));
      await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("user_id", userId)
        .eq("product_id", product.productId);
      toast.success("Quantity updated in cart");
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      setItems(prev => [...prev, newItem]);
      const { data } = await supabase
        .from("cart_items")
        .insert({
          user_id: userId,
          product_id: product.productId,
          merchant_id: product.merchantId,
          name: product.name,
          price: product.price,
          image: product.image,
          merchant_name: product.merchant,
          quantity: 1,
        })
        .select("id")
        .single();
      if (data) {
        setItems(prev => prev.map(item =>
          item.productId === product.productId ? { ...item, id: data.id } : item
        ));
      }
      toast.success("Added to cart");
    }
  }, [userId, items]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!userId) return;
    setItems(prev => prev.filter(item => item.productId !== productId));
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    toast.success("Removed from cart");
  }, [userId]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (!userId) return;
    setItems(prev => prev.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", userId)
      .eq("product_id", productId);
  }, [userId, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (!userId) return;
    setItems([]);
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
  }, [userId]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
