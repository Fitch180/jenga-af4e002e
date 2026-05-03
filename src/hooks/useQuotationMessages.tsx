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
  attachment_url: string | null;
  attachment_name: string | null;
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

  const uploadAttachment = async (file: File): Promise<{ url: string; name: string } | null> => {
    if (!user) return null;
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("quotation-attachments")
      .upload(filePath, file);

    if (error) {
      toast.error("Failed to upload file");
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("quotation-attachments")
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, name: file.name };
  };

  const sendMessage = async (
    message: string,
    proposedPrice?: number,
    senderType: "user" | "merchant" = "user",
    attachmentUrl?: string,
    attachmentName?: string
  ) => {
    if (!user || !quotationId) return false;
    const { error } = await supabase.from("quotation_messages").insert({
      quotation_id: quotationId,
      sender_id: user.id,
      sender_type: senderType,
      message: message.trim() || null,
      proposed_price: proposedPrice || null,
      attachment_url: attachmentUrl || null,
      attachment_name: attachmentName || null,
    });
    if (error) { toast.error("Failed to send message"); return false; }
    return true;
  };

  return { messages, loading, sendMessage, uploadAttachment, refetch: fetchMessages };
};
