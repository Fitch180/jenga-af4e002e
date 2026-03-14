import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StatusHistoryEntry {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  location: string | null;
  created_by: string | null;
  created_at: string;
}

export function useDeliveryTracking(orderId: string | null) {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!orderId) {
      setHistory([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setHistory((data as StatusHistoryEntry[]) || []);
    } catch (error: any) {
      // Table might not exist yet
      console.error("Error fetching delivery tracking:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchHistory();

    if (!orderId) return;

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_status_history", filter: `order_id=eq.${orderId}` },
        () => fetchHistory()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHistory, orderId]);

  const addTrackingUpdate = async (
    orderIdParam: string,
    status: string,
    note?: string,
    location?: string
  ): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error } = await supabase
        .from("order_status_history")
        .insert({
          order_id: orderIdParam,
          status,
          note: note || null,
          location: location || null,
          created_by: userData.user.id,
        });

      if (error) throw error;
      fetchHistory();
      return true;
    } catch (error: any) {
      console.error("Error adding tracking update:", error);
      toast.error("Failed to add tracking update");
      return false;
    }
  };

  return { history, loading, addTrackingUpdate, refetch: fetchHistory };
}
