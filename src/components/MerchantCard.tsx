import { useState } from "react";
import { Pin, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MerchantCardProps {
  name: string;
  location: string;
  image: string;
  isPinned?: boolean;
  onPin?: () => void;
  category?: string;
  description?: string;
}

export const MerchantCard = ({ name, location, image, isPinned, onPin, category, description }: MerchantCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Card className="relative overflow-hidden bg-card hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!user) {
            toast.error("Please login to pin merchants");
            navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
          }
          onPin?.();
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-foreground/90 rounded-full flex items-center justify-center hover:bg-foreground transition-colors"
      >
        <Pin className={`w-4 h-4 ${isPinned ? 'fill-jenga-orange text-jenga-orange' : 'text-background'}`} />
      </button>
      
      <div className="flex items-start p-4 gap-4">
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {imageLoading && (
            <Skeleton className="w-full h-full" />
          )}
          {imageError || !image ? (
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
        
        <div className="flex-1 space-y-2 min-w-0">
          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <button className="text-accent hover:text-accent/80 text-sm font-medium transition-colors">
            Get Direction
          </button>
        </div>
      </div>
    </Card>
  );
};
