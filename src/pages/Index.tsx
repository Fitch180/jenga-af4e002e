import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { MerchantCard } from "@/components/MerchantCard";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BottomNav } from "@/components/BottomNav";
import SearchFilterDialog from "@/components/SearchFilterDialog";
import Chat from "./Chat";
import Profile from "./Profile";
import { CATEGORIES, MERCHANTS, PRODUCTS } from "@/data/mockData";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("merchants");
  const [activeCategory, setActiveCategory] = useState("All");
  const [pinnedMerchants, setPinnedMerchants] = useState<number[]>([]);
  const [pinnedProducts, setPinnedProducts] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    if (tab === "cart") {
      navigate("/cart");
    } else {
      setActiveTab(tab);
    }
  };

  const toggleMerchantPin = (id: number) => {
    setPinnedMerchants((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleProductPin = (id: string) => {
    setPinnedProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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

    if (activeTab === "merchants") {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Featured Merchants</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {MERCHANTS.slice(0, 5).map((merchant) => (
                <div key={merchant.id} className="flex-shrink-0 w-24">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mx-auto mb-2">
                    <img
                      src={merchant.image}
                      alt={merchant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground truncate">
                    {merchant.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
                  isPinned={pinnedMerchants.includes(merchant.id)}
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
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Featured Products</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {PRODUCTS.slice(0, 5).map((product) => (
                <div key={product.id} className="flex-shrink-0 w-24">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mx-auto mb-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground truncate">
                    {product.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

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
                isPinned={pinnedProducts.includes(product.id)}
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
            {activeTab === "merchants" ? "Featured Merchants" : "Featured Products"}
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
