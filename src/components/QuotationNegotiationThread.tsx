import { useState, useRef } from "react";
import { Send, DollarSign, Paperclip, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useQuotationMessages } from "@/hooks/useQuotationMessages";
import { toast } from "sonner";

interface QuotationNegotiationThreadProps {
  quotationId: string;
  senderType?: "user" | "merchant";
}

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png", "image/jpeg", "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const QuotationNegotiationThread = ({ quotationId, senderType = "user" }: QuotationNegotiationThreadProps) => {
  const { messages, loading, sendMessage, uploadAttachment } = useQuotationMessages(quotationId);
  const [newMessage, setNewMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Use PDF, images, Excel, or Word documents.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !proposedPrice && !selectedFile) return;
    setSending(true);

    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;

    if (selectedFile) {
      const result = await uploadAttachment(selectedFile);
      if (!result) { setSending(false); return; }
      attachmentUrl = result.url;
      attachmentName = result.name;
    }

    const price = proposedPrice ? parseFloat(proposedPrice) : undefined;
    await sendMessage(newMessage, price, senderType, attachmentUrl, attachmentName);
    setNewMessage("");
    setProposedPrice("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSending(false);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (["xls", "xlsx"].includes(ext || "")) return "📊";
    if (["doc", "docx"].includes(ext || "")) return "📝";
    if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return "🖼️";
    return "📎";
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
                {msg.attachment_url && msg.attachment_name && (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 mt-1.5 p-1.5 rounded text-xs font-medium ${
                      msg.sender_type === senderType
                        ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                        : "bg-background/50 hover:bg-background/80"
                    } transition-colors`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{msg.attachment_name}</span>
                  </a>
                )}
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

        {selectedFile && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
            </span>
            <button
              onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="flex-1 resize-none text-sm"
          />
          <div className="flex flex-col gap-1 self-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.xls,.xlsx,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file (PDF, drawing, BoQ)"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || (!newMessage.trim() && !proposedPrice && !selectedFile)}
              size="icon"
              className="bg-accent hover:bg-accent/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationNegotiationThread;
