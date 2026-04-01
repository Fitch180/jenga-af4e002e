import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMerchantVolumeDiscounts, useVolumeDiscounts } from "@/hooks/useVolumeDiscounts";
import { toast } from "sonner";

interface VolumeDiscountManagerProps {
  productId: string;
  basePrice: number | null;
}

export default function VolumeDiscountManager({ productId, basePrice }: VolumeDiscountManagerProps) {
  const { discounts, loading, refetch } = useVolumeDiscounts(productId);
  const { addDiscount, removeDiscount } = useMerchantVolumeDiscounts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [minQty, setMinQty] = useState("");
  const [discountPct, setDiscountPct] = useState("");

  const handleAdd = async () => {
    const qty = parseInt(minQty);
    const pct = parseFloat(discountPct);

    if (!qty || qty < 2) {
      toast.error("Minimum quantity must be at least 2");
      return;
    }
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    const success = await addDiscount(productId, {
      min_quantity: qty,
      discount_percentage: pct,
    });

    if (success) {
      setDialogOpen(false);
      setMinQty("");
      setDiscountPct("");
      refetch();
    }
  };

  const handleRemove = async (discountId: string) => {
    const success = await removeDiscount(discountId);
    if (success) refetch();
  };

  if (basePrice === null) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-sm">
          <Tag className="w-3.5 h-3.5" /> Volume Discounts
        </Label>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Tier
        </Button>
      </div>

      {loading && <p className="text-xs text-muted-foreground">Loading discounts...</p>}

      {discounts.length > 0 && (
        <div className="space-y-1.5">
          {discounts.map((d) => {
            const discountedPrice = Math.round(basePrice * (1 - d.discount_percentage / 100));
            return (
              <div
                key={d.id}
                className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{d.min_quantity}+ units</span>
                  <span className="text-muted-foreground ml-2">
                    {d.discount_percentage}% off → {discountedPrice.toLocaleString()} Tsh each
                  </span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRemove(d.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Volume Discount Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Quantity *</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Percentage (%) *</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
              />
              {basePrice && discountPct && !isNaN(parseFloat(discountPct)) && (
                <p className="text-xs text-muted-foreground">
                  Price per unit: {Math.round(basePrice * (1 - parseFloat(discountPct) / 100)).toLocaleString()} Tsh
                  (was {basePrice.toLocaleString()} Tsh)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleAdd}>
              Add Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
