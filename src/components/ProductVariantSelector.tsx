import { Badge } from "@/components/ui/badge";
import { useProductVariants, ProductVariant } from "@/hooks/useProductVariants";

interface ProductVariantSelectorProps {
  productId: string;
  onVariantSelect?: (variant: ProductVariant | null) => void;
  selectedVariantId?: string | null;
}

const ProductVariantSelector = ({ productId, onVariantSelect, selectedVariantId }: ProductVariantSelectorProps) => {
  const { groupedVariants, loading } = useProductVariants(productId);

  if (loading || Object.keys(groupedVariants).length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      {Object.entries(groupedVariants).map(([type, variants]) => (
        <div key={type}>
          <p className="text-sm font-medium text-muted-foreground mb-2 capitalize">{type}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => onVariantSelect?.(isSelected ? null : variant)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-foreground hover:border-accent/50"
                  }`}
                >
                  {variant.variant_value}
                  {variant.price_adjustment !== 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      {variant.price_adjustment > 0 ? "+" : ""}{variant.price_adjustment.toLocaleString()} Tsh
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariantSelector;
