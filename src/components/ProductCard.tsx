import { Pin, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  merchant: string;
  image: string;
  isPinned?: boolean;
  onPin?: () => void;
}

export const ProductCard = ({ id, name, price, merchant, image, isPinned, onPin }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
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
          className="w-8 h-8 bg-foreground/90 rounded-full flex items-center justify-center hover:bg-foreground transition-colors"
        >
          <Pin className={`w-4 h-4 ${isPinned ? 'fill-accent text-accent' : 'text-background'}`} />
        </button>
        <Button
          size="sm"
          onClick={handleAddToCart}
          className="w-8 h-8 p-0 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center p-4 gap-4">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{merchant}</p>
          <p className="text-xl font-bold text-accent">{price}</p>
        </div>
      </div>
    </Card>
  );
};
