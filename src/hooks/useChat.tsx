import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

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
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading conversations:", error);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    };

    loadConversations();
  }, [user]);

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
    if (!user) return;

    const channel = supabase
      .channel("messages")
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
  }, [user]);

  // Create or get conversation
  const getOrCreateConversation = async (
    merchantId: number,
    merchantName: string,
    merchantImage: string | null
  ) => {
    if (!user) return null;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .eq("merchant_id", merchantId)
      .maybeSingle();

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        merchant_id: merchantId,
        merchant_name: merchantName,
        merchant_image: merchantImage,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    return data.id;
  };

  // Send text message
  const sendMessage = async (conversationId: string, text: string) => {
    if (!user || !text.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "user",
      sender_id: user.id,
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

  // Upload and send image
  const sendImage = async (conversationId: string, file: File) => {
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return;
    }

    const { data } = supabase.storage.from("chat-images").getPublicUrl(filePath);

    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "user",
      sender_id: user.id,
      image_url: data.publicUrl,
    });

    if (messageError) {
      toast({
        title: "Error",
        description: "Failed to send image",
        variant: "destructive",
      });
    }
  };

  // Upload and send document
  const sendDocument = async (conversationId: string, file: File) => {
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-documents")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      return;
    }

    const { data } = supabase.storage.from("chat-documents").getPublicUrl(filePath);

    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "user",
      sender_id: user.id,
      document_url: data.publicUrl,
      text: file.name,
    });

    if (messageError) {
      toast({
        title: "Error",
        description: "Failed to send document",
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
    getOrCreateConversation,
    sendMessage,
    sendImage,
    sendDocument,
    markAsRead,
  };
};
