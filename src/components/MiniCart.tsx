import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MiniCartProps {
  isActive?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MiniCart = ({ isActive, onOpenChange }: MiniCartProps) => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();

  const handleViewCart = () => {
    onOpenChange?.(false);
    navigate("/cart");
  };

  const handleCheckout = () => {
    onOpenChange?.(false);
    navigate("/checkout");
  };

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <ShoppingCart className="w-6 h-6 mb-1" />
          {totalItems > 0 && (
            <Badge className="absolute top-1 right-1/4 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
              {totalItems}
            </Badge>
          )}
          <span className="text-xs font-medium">Cart</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-card border border-border shadow-lg z-50" 
        align="center"
        side="top"
        sideOffset={8}
      >
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Shopping Cart ({totalItems})</h3>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-64">
              <div className="p-2 space-y-2">
                {items.slice(0, 5).map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.merchant}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-semibold text-accent">
                          {item.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.productId, item.quantity - 1);
                            }}
                            className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.productId, item.quantity + 1);
                            }}
                            className="w-6 h-6 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromCart(item.productId);
                            }}
                            className="w-6 h-6 rounded-full hover:bg-destructive/10 flex items-center justify-center transition-colors ml-1"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {items.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground py-2">
                    +{items.length - 5} more items
                  </p>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-foreground">
                  {totalPrice.toLocaleString()} Tsh
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleViewCart}
                >
                  View Cart
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
