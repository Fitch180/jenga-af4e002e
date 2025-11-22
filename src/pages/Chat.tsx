import { useState } from "react";
import { ArrowLeft, Send, Paperclip, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: "user" | "merchant";
  text?: string;
  image?: string;
  document?: string;
  timestamp: Date;
}

interface Conversation {
  id: number;
  merchantName: string;
  merchantImage: string;
  lastMessage: string;
  unread: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    merchantName: "Dar Ceramica Center",
    merchantImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&h=100&fit=crop",
    lastMessage: "We have the tiles in stock",
    unread: true,
  },
  {
    id: 2,
    merchantName: "Modern Living Furniture",
    merchantImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=100&h=100&fit=crop",
    lastMessage: "Your quotation is ready",
    unread: false,
  },
  {
    id: 3,
    merchantName: "Elite Hardware Supplies",
    merchantImage: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=100&h=100&fit=crop",
    lastMessage: "Thank you for your inquiry",
    unread: false,
  },
];

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "merchant",
      text: "Hello! How can I help you today?",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      sender: "user",
      text: "I'm interested in your ceramic tiles",
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: 3,
      sender: "merchant",
      text: "Great! We have the tiles in stock. What size are you looking for?",
      timestamp: new Date(Date.now() - 2400000),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    toast({
      title: "Message sent",
      description: "The merchant will respond shortly",
    });
  };

  const handleFileUpload = (type: "image" | "document") => {
    toast({
      title: `${type === "image" ? "Image" : "Document"} upload`,
      description: "File upload feature coming soon",
    });
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
          <div className="space-y-3">
            {MOCK_CONVERSATIONS.map((conv) => (
              <Card
                key={conv.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedConversation(conv.id)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={conv.merchantImage} alt={conv.merchantName} />
                    <AvatarFallback>{conv.merchantName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {conv.merchantName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === selectedConversation);

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
            <AvatarImage src={conversation?.merchantImage} alt={conversation?.merchantName} />
            <AvatarFallback>{conversation?.merchantName[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">{conversation?.merchantName}</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.text && <p className="text-sm">{message.text}</p>}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Shared"
                    className="rounded mt-2 max-w-full"
                  />
                )}
                {message.document && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-background/10 rounded">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-xs">{message.document}</span>
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="sticky bottom-0 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFileUpload("image")}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFileUpload("document")}
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
