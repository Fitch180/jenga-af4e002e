import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface QuotationMessage {
  id: string;
  quotation_id: string;
  sender_id: string;
  sender_type: string;
  message: string | null;
  proposed_price: number | null;
  created_at: string;
}

export const useQuotationMessages = (quotationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<QuotationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!quotationId) { setMessages([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("quotation_messages")
      .select("*")
      .eq("quotation_id", quotationId)
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching quotation messages:", error);
    else setMessages((data as QuotationMessage[]) || []);
    setLoading(false);
  }, [quotationId]);

  useEffect(() => {
    fetchMessages();

    if (!quotationId) return;
    const channel = supabase
      .channel(`quotation-messages-${quotationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "quotation_messages",
        filter: `quotation_id=eq.${quotationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as QuotationMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages, quotationId]);

  const sendMessage = async (message: string, proposedPrice?: number, senderType: "user" | "merchant" = "user") => {
    if (!user || !quotationId) return false;
    const { error } = await supabase.from("quotation_messages").insert({
      quotation_id: quotationId,
      sender_id: user.id,
      sender_type: senderType,
      message: message.trim() || null,
      proposed_price: proposedPrice || null,
    });
    if (error) { toast.error("Failed to send message"); return false; }
    return true;
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
};
