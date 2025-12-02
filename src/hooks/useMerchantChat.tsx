import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  conversation_id: string;
  sender_type: "user" | "merchant";
  sender_id: string;
  text?: string;
  image_url?: string;
  document_url?: string;
  created_at: string;
}

interface Conversation {
  id: string;
  merchant_id: number;
  merchant_name: string;
  merchant_image: string | null;
  last_message: string | null;
  unread: boolean;
  updated_at: string;
  user_id: string;
}

export const useMerchantChat = (merchantId: number) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations for this merchant
  useEffect(() => {
    const loadConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("merchant_id", merchantId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading conversations:", error);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    };

    loadConversations();
  }, [merchantId]);

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } else {
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as "user" | "merchant"
      })) as Message[];
      setMessages(typedMessages);
    }
  };

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = supabase
      .channel("merchant-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = {
            ...payload.new,
            sender_type: payload.new.sender_type as "user" | "merchant",
          } as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Send message as merchant
  const sendMessage = async (conversationId: string, text: string, merchantId: string) => {
    if (!text.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "merchant",
      sender_id: merchantId,
      text: text.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    await supabase
      .from("conversations")
      .update({ unread: false })
      .eq("id", conversationId);
  };

  return {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    markAsRead,
  };
};
