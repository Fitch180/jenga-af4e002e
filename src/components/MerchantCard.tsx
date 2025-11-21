import { Pin, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MerchantCardProps {
  name: string;
  location: string;
  image: string;
  isPinned?: boolean;
  onPin?: () => void;
}

export const MerchantCard = ({ name, location, image, isPinned, onPin }: MerchantCardProps) => {
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
      
      <div className="flex flex-col items-center p-6 space-y-4">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        <div className="text-center space-y-2 w-full">
          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <button className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
            Get Direction
          </button>
        </div>
      </div>
    </Card>
  );
};
