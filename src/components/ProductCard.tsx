import { Pin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  name: string;
  price: string;
  merchant: string;
  image: string;
  isPinned?: boolean;
  onPin?: () => void;
}

export const ProductCard = ({ name, price, merchant, image, isPinned, onPin }: ProductCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPin?.();
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-foreground/90 rounded-full flex items-center justify-center hover:bg-foreground transition-colors"
      >
        <Pin className={`w-4 h-4 ${isPinned ? 'fill-accent text-accent' : 'text-background'}`} />
      </button>
      
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
