import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuotations } from "@/hooks/useQuotations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface QuotationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId: string;
  merchantId: string;
  merchantName: string;
}

export default function QuotationRequestDialog({
  open,
  onOpenChange,
  productName,
  productId,
  merchantId,
  merchantName,
}: QuotationRequestDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createQuotation } = useQuotations();
  const [quantity, setQuantity] = useState("1");
  const [specifications, setSpecifications] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!user) {
      toast.error("Please login to upload documents");
      return;
    }

    const maxFiles = 5;
    const remaining = maxFiles - documents.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxFiles} documents allowed`);
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    setUploading(true);

    try {
      for (const file of filesToUpload) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/quotations/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("chat-documents")
          .upload(fileName, file, { upsert: true });

        if (error) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("chat-documents")
          .getPublicUrl(fileName);

        setDocuments(prev => [...prev, { name: file.name, url: publicUrl }]);
      }
      toast.success("Document(s) uploaded");
    } catch {
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const docInfo = documents.length > 0
        ? `\n\nAttached Documents:\n${documents.map(d => `- ${d.name}: ${d.url}`).join("\n")}`
        : "";

      const success = await createQuotation({
        merchant_id: merchantId,
        message: message + docInfo,
        items: [
          {
            product_id: productId,
            product_name: productName,
            quantity: parseInt(quantity) || 1,
            specifications: specifications || undefined,
          },
        ],
      });

      if (success) {
        setQuantity("1");
        setSpecifications("");
        setMessage("");
        setDocuments([]);
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Quotation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium text-foreground">{productName}</p>
            <p className="text-xs text-muted-foreground">from {merchantName}</p>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
          </div>

          <div className="space-y-2">
            <Label>Specifications (optional)</Label>
            <Textarea
              placeholder="e.g., size, color, material preferences..."
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Project Details *</Label>
            <Textarea
              placeholder="Describe your project, timeline, delivery requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Supporting Documents (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
              disabled={uploading}
            />

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {documents.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-dashed"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? "Uploading..." : "Upload Documents"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              PDF, Word, Excel, images — max 10MB each, up to 5 files
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}