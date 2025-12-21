import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pin } from "lucide-react";
import { MerchantCard } from "@/components/MerchantCard";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BottomNav } from "@/components/BottomNav";
import SearchFilterDialog from "@/components/SearchFilterDialog";
import Chat from "./Chat";
import Profile from "./Profile";
import { CATEGORIES, MERCHANTS, PRODUCTS } from "@/data/mockData";
import { usePinned } from "@/contexts/PinnedContext";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("merchants");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const { isMerchantPinned, isProductPinned, toggleMerchantPin, toggleProductPin } = usePinned();

  const handleTabChange = (tab: string) => {
    if (tab === "cart") {
      navigate("/cart");
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    if (activeTab === "notifications") {
      return <Chat />;
    }

    if (activeTab === "profile") {
      return <Profile />;
    }

    const filteredMerchants = activeCategory === "All" 
      ? MERCHANTS 
      : MERCHANTS.filter(m => m.category === activeCategory);

    const filteredProducts = activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === activeCategory);

    const pinnedMerchantsList = MERCHANTS.filter(m => isMerchantPinned(m.id));
    const pinnedProductsList = PRODUCTS.filter(p => isProductPinned(p.id));

    if (activeTab === "merchants") {
      return (
        <div className="space-y-6">
          {pinnedMerchantsList.length > 0 && (
            <div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {pinnedMerchantsList.map((merchant) => (
                  <div 
                    key={merchant.id} 
                    className="flex-shrink-0 w-24"
                  >
                    <div className="relative mx-auto mb-2">
                      <div 
                        className="w-20 h-20 rounded-full overflow-hidden bg-muted ring-2 ring-primary cursor-pointer"
                        onClick={() => navigate(`/merchant/${merchant.id}`)}
                      >
                        <img
                          src={merchant.image}
                          alt={merchant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMerchantPin(merchant.id);
                        }}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-jenga-orange flex items-center justify-center shadow-md hover:bg-jenga-orange/80 transition-colors"
                      >
                        <Pin className="w-3 h-3 text-white fill-white" />
                      </button>
                    </div>
                    <p 
                      className="text-xs text-center text-muted-foreground truncate cursor-pointer"
                      onClick={() => navigate(`/merchant/${merchant.id}`)}
                    >
                      {merchant.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CategoryFilter
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="space-y-3">
            {filteredMerchants.map((merchant) => (
              <div key={merchant.id} onClick={() => navigate(`/merchant/${merchant.id}`)}>
                <MerchantCard
                  {...merchant}
                  isPinned={isMerchantPinned(merchant.id)}
                  onPin={() => toggleMerchantPin(merchant.id)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "products") {
      return (
        <div className="space-y-6">
          {pinnedProductsList.length > 0 && (
            <div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {pinnedProductsList.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0 w-24"
                  >
                    <div className="relative mx-auto mb-2">
                      <div 
                        className="w-20 h-20 rounded-full overflow-hidden bg-muted ring-2 ring-primary cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductPin(product.id);
                        }}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-jenga-orange flex items-center justify-center shadow-md hover:bg-jenga-orange/80 transition-colors"
                      >
                        <Pin className="w-3 h-3 text-white fill-white" />
                      </button>
                    </div>
                    <p 
                      className="text-xs text-center text-muted-foreground truncate cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CategoryFilter
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isPinned={isProductPinned(product.id)}
                onPin={() => toggleProductPin(product.id)}
              />
            ))}
          </div>
        </div>
      );
    }
  };

  // For chat and profile tabs, render them full-screen without header
  if (activeTab === "notifications" || activeTab === "profile") {
    return (
      <div className="min-h-screen bg-background">
        {renderContent()}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search Dialog */}
      <SearchFilterDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        type={activeTab === "merchants" ? "merchants" : "products"}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
            {activeTab === "merchants" ? "Merchants" : "Products"}
          </h1>
          <button 
            onClick={() => setSearchOpen(true)}
            className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg"
          >
            <Search className="w-6 h-6 text-accent-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
