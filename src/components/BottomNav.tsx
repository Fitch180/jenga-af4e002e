import { Home, Package, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniCart } from "@/components/MiniCart";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "merchants", label: "Merchants", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "cart", label: "Cart", icon: null }, // Cart uses MiniCart component
    { id: "notifications", label: "Chat", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center max-w-screen-xl mx-auto">
        {tabs.map((tab) => {
          if (tab.id === "cart") {
            return (
              <MiniCart 
                key={tab.id} 
                isActive={activeTab === tab.id}
                onOpenChange={(open) => {
                  if (open) onTabChange(tab.id);
                }}
              />
            );
          }

          const Icon = tab.icon!;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
