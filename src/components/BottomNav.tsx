import { Home, Package, User, LayoutDashboard, MessageSquare, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";

interface BottomNavProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const BottomNav = ({ activeTab }: BottomNavProps) => {
  const { isMerchant } = useUserRole();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const dashboardNotifications = 3;

  const navigateToHomeTab = (tab: "merchants" | "products") => {
    navigate(tab === "products" ? "/?tab=products" : "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center max-w-screen-xl mx-auto">
        <button
          onClick={() => navigateToHomeTab("merchants")}
          className={cn(
            "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative",
            activeTab === "merchants" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Merchants</span>
        </button>

        <button
          onClick={() => navigateToHomeTab("products")}
          className={cn(
            "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative",
            activeTab === "products" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Package className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Products</span>
        </button>

        <button
          onClick={() => navigate("/cart")}
          className={cn(
            "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative",
            activeTab === "cart" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 mb-1" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground">
                {totalItems}
              </Badge>
            )}
          </div>
          <span className="text-xs font-medium">Cart</span>
        </button>

        {isMerchant ? (
          <button
            onClick={() => navigate("/merchant-dashboard")}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative",
              activeTab === "dashboard" || activeTab === "merchant-dashboard"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <LayoutDashboard className="w-6 h-6 mb-1" />
              {dashboardNotifications > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                  {dashboardNotifications}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">Dashboard</span>
          </button>
        ) : (
          <button
            onClick={() => navigate("/chat")}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative",
              activeTab === "chat" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MessageSquare className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Chat</span>
          </button>
        )}

        <button
          onClick={() => navigate("/profile")}
          className={cn(
            "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative",
            activeTab === "profile" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};