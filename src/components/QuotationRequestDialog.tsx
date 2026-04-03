import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuotations } from "@/hooks/useQuotations";
import { useAuth } from "@/hooks/useAuth";

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

  const handleSubmit = async () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await createQuotation({
        merchant_id: merchantId,
        message,
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
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
