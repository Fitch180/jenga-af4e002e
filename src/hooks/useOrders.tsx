import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "mpesa" | "airtel" | "card" | "cash";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  region: string;
  district: string;
  street: string;
  landmark?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  merchant_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  tracking_number: string | null;
  delivery_full_name: string;
  delivery_phone: string;
  delivery_region: string;
  delivery_district: string;
  delivery_street: string;
  delivery_landmark: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  merchant_profiles?: {
    business_name: string;
  };
}

export interface CreateOrderData {
  merchant_id: string;
  payment_method: PaymentMethod;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: DeliveryAddress;
  items: {
    product_id: string;
    product_name: string;
    product_image: string | null;
    price: number;
    quantity: number;
  }[];
}

export function useOrders(userId?: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*),
          merchant_profiles (business_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const createOrder = async (orderData: CreateOrderData): Promise<string | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Please login to place an order");
        return null;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userData.user.id,
          merchant_id: orderData.merchant_id,
          payment_method: orderData.payment_method,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          total_amount: orderData.total_amount,
          delivery_full_name: orderData.delivery_address.fullName,
          delivery_phone: orderData.delivery_address.phone,
          delivery_region: orderData.delivery_address.region,
          delivery_district: orderData.delivery_address.district,
          delivery_street: orderData.delivery_address.street,
          delivery_landmark: orderData.delivery_address.landmark || null,
          tracking_number: `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Order placed successfully!");
      fetchOrders();
      return order.id;
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order: " + error.message);
      return null;
    }
  };

  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((o) => o.id === orderId);
    },
    [orders]
  );

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      const statusMessages: Record<OrderStatus, string> = {
        pending: "Order is pending",
        confirmed: "Order has been confirmed!",
        processing: "Order is being processed",
        shipped: "Order has been shipped!",
        delivered: "Order has been delivered!",
        cancelled: "Order has been cancelled",
      };

      toast.success(statusMessages[status]);
      fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
      return false;
    }
  };

  const updateDeliveryFee = async (orderId: string, deliveryFee: number): Promise<boolean> => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return false;

      const newTotal = order.subtotal + deliveryFee;

      const { error } = await supabase
        .from("orders")
        .update({ 
          delivery_fee: deliveryFee,
          total_amount: newTotal,
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Delivery fee updated!");
      fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Error updating delivery fee:", error);
      toast.error("Failed to update delivery fee");
      return false;
    }
  };

  return {
    orders,
    loading,
    createOrder,
    getOrderById,
    updateOrderStatus,
    updateDeliveryFee,
    refetch: fetchOrders,
  };
}

export function useMerchantOrders(merchantId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!merchantId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("merchant_id", merchantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error: any) {
      console.error("Error fetching merchant orders:", error);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchOrders();

    if (!merchantId) return;

    const channel = supabase
      .channel(`merchant-orders-${merchantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, merchantId]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${status}`);
      fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
      return false;
    }
  };

  const updateDeliveryFee = async (orderId: string, deliveryFee: number): Promise<boolean> => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return false;

      const newTotal = order.subtotal + deliveryFee;

      const { error } = await supabase
        .from("orders")
        .update({ 
          delivery_fee: deliveryFee,
          total_amount: newTotal,
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Delivery fee set! Customer notified.");
      fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Error updating delivery fee:", error);
      toast.error("Failed to update delivery fee");
      return false;
    }
  };

  const updateTrackingNumber = async (orderId: string, trackingNumber: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ tracking_number: trackingNumber })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Tracking number updated!");
      fetchOrders();
      return true;
    } catch (error: any) {
      console.error("Error updating tracking number:", error);
      toast.error("Failed to update tracking number");
      return false;
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    updateDeliveryFee,
    updateTrackingNumber,
    refetch: fetchOrders,
  };
}
