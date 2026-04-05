import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Paperclip, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { BottomNav } from "@/components/BottomNav";

const Chat = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    sendImage,
    sendDocument,
    markAsRead,
  } = useChat();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Auto-select conversation from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get("conversation");
    
    if (conversationId && conversations.length > 0) {
      setSelectedConversation(conversationId);
    }
  }, [conversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    await sendMessage(selectedConversation, newMessage);
    setNewMessage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedConversation) {
      sendImage(selectedConversation, file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedConversation) {
      sendDocument(selectedConversation, file);
    }
  };

  if (selectedConversation === null) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          {conversations.length === 0 ? (
            <p className="text-center text-muted-foreground mt-8">
              No conversations yet. Start chatting with merchants from their profile pages!
            </p>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={conv.merchant_image || undefined} alt={conv.merchant_name} />
                      <AvatarFallback>{conv.merchant_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {conv.merchant_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message || "Start a conversation"}
                      </p>
                    </div>
                    {conv.unread && (
                      <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
        <BottomNav activeTab="chat" onTabChange={(tab) => { if (tab === "merchants" || tab === "products") navigate("/"); }} />
      </div>
    );
  }

  const conversation = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setSelectedConversation(null)}
            className="hover:opacity-80"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={conversation?.merchant_image || undefined} alt={conversation?.merchant_name} />
            <AvatarFallback>{conversation?.merchant_name[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">{conversation?.merchant_name}</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.sender_type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.text && <p className="text-sm">{message.text}</p>}
                {message.image_url && (
                  <img
                    src={message.image_url}
                    alt="Shared"
                    className="rounded mt-2 max-w-full"
                  />
                )}
                {message.document_url && (
                  <a
                    href={message.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-2 p-2 bg-background/10 rounded hover:bg-background/20"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="text-xs">{message.text || "Document"}</span>
                  </a>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={documentInputRef}
        type="file"
        className="hidden"
        onChange={handleDocumentUpload}
      />

      <div className="sticky bottom-0 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => documentInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon" className="bg-accent hover:bg-accent/90">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
