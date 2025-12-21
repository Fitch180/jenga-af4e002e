import { useState } from "react";
import { Pin, ShoppingCart, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  merchant: string;
  image: string;
  isPinned?: boolean;
  onPin?: () => void;
  itemType?: "product" | "service";
}

export const ProductCard = ({ id, name, price, merchant, image, isPinned, onPin, itemType = "product" }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: `${id}-${Date.now()}`,
      productId: id,
      name,
      price,
      image,
      merchant,
    });
  };

  const handleRequestQuotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Quotation request sent!", {
      description: `Your request for ${name} has been sent to ${merchant}`,
    });
  };
  
  return (
    <Card 
      onClick={() => navigate(`/product/${id}`)}
      className="relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin?.();
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isPinned 
              ? 'bg-jenga-orange hover:bg-jenga-orange/90' 
              : 'bg-foreground/90 hover:bg-foreground'
          }`}
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-white text-white' : 'text-background'}`} />
        </button>
        {itemType === "service" ? (
          <Button
            size="sm"
            onClick={handleRequestQuotation}
            className="w-8 h-8 p-0 bg-jenga-orange hover:bg-jenga-orange/90 text-white rounded-full"
          >
            <FileText className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="w-8 h-8 p-0 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center p-4 gap-4">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {imageLoading && (
            <Skeleton className="w-full h-full" />
          )}
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
              <span className="text-2xl font-bold">{name.charAt(0)}</span>
            </div>
          ) : (
            <img
              src={image}
              alt={name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${imageLoading ? 'hidden' : 'block'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            {itemType === "service" && (
              <span className="text-xs bg-jenga-orange/10 text-jenga-orange px-2 py-0.5 rounded-full font-medium">
                Service
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{merchant}</p>
          <p className="text-xl font-bold text-accent">{price}</p>
        </div>
      </div>
    </Card>
  );
};
