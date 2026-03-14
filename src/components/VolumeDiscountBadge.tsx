import { Tag } from "lucide-react";
import { useVolumeDiscounts, getApplicableDiscount } from "@/hooks/useVolumeDiscounts";

interface VolumeDiscountBadgeProps {
  productId: string;
  basePrice: number;
  quantity?: number;
  showTiers?: boolean;
}

const VolumeDiscountBadge = ({ productId, basePrice, quantity = 1, showTiers = false }: VolumeDiscountBadgeProps) => {
  const { discounts } = useVolumeDiscounts(productId);

  if (!discounts.length) return null;

  const { discountedPrice, discountPercentage, tier } = getApplicableDiscount(discounts, quantity, basePrice);
  const lowestTier = discounts[0]; // Already sorted by min_quantity ascending

  return (
    <div className="space-y-2">
      {/* Active discount badge */}
      {tier && quantity >= tier.min_quantity && (
        <div className="bg-green-500/10 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Bulk discount: {discountPercentage}% off — {discountedPrice.toLocaleString()} Tsh/unit
        </div>
      )}

      {/* Next tier hint */}
      {!tier && lowestTier && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Buy {lowestTier.min_quantity}+ for {lowestTier.discount_percentage}% off
        </div>
      )}

      {/* Show all tiers */}
      {showTiers && discounts.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Volume Pricing:</p>
          {discounts.map((d) => {
            const isActive = tier?.id === d.id;
            const unitPrice = d.discounted_price || Math.round(basePrice * (1 - d.discount_percentage / 100));
            return (
              <div
                key={d.id}
                className={`text-xs flex justify-between px-2 py-1 rounded ${
                  isActive ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground"
                }`}
              >
                <span>{d.min_quantity}+ units</span>
                <span>{unitPrice.toLocaleString()} Tsh/unit ({d.discount_percentage}% off)</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VolumeDiscountBadge;
