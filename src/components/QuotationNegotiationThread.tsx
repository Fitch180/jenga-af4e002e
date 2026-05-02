import { useState } from "react";
import { Send, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useQuotationMessages } from "@/hooks/useQuotationMessages";

interface QuotationNegotiationThreadProps {
  quotationId: string;
  senderType?: "user" | "merchant";
}

const QuotationNegotiationThread = ({ quotationId, senderType = "user" }: QuotationNegotiationThreadProps) => {
  const { messages, loading, sendMessage } = useQuotationMessages(quotationId);
  const [newMessage, setNewMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() && !proposedPrice) return;
    setSending(true);
    const price = proposedPrice ? parseFloat(proposedPrice) : undefined;
    await sendMessage(newMessage, price, senderType);
    setNewMessage("");
    setProposedPrice("");
    setSending(false);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Negotiation Thread</h4>
      
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet. Start the negotiation.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === senderType ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-lg p-2.5 text-sm ${
                msg.sender_type === senderType
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {msg.proposed_price && (
                  <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                    <DollarSign className="w-3 h-3" />
                    Counter-offer: {msg.proposed_price.toLocaleString()} Tsh
                  </div>
                )}
                {msg.message && <p>{msg.message}</p>}
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="Counter-offer (optional)"
              className="pl-7 text-sm"
              type="number"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="flex-1 resize-none text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={sending || (!newMessage.trim() && !proposedPrice)}
            size="icon"
            className="bg-accent hover:bg-accent/90 self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotationNegotiationThread;
