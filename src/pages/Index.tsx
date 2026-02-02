import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pin, Loader2 } from "lucide-react";
import { MerchantCard } from "@/components/MerchantCard";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BottomNav } from "@/components/BottomNav";
import SearchFilterDialog from "@/components/SearchFilterDialog";
import NotificationBell from "@/components/NotificationBell";
import Chat from "./Chat";
import Profile from "./Profile";
import { CATEGORIES } from "@/data/mockData";
import { usePinned } from "@/contexts/PinnedContext";
import { supabase } from "@/integrations/supabase/client";

interface MerchantProfile {
  id: string;
  user_id: string;
  business_name: string;
  country_registered: string;
  approval_status: string;
  profile_image_url: string | null;
  background_image_url: string | null;
  phone_number: string | null;
  email: string | null;
  description: string | null;
  category: string | null;
}

interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string;
  image_url: string | null;
  item_type: string;
  merchant_profiles?: {
    business_name: string;
  };
}

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("merchants");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const { isMerchantPinned, isProductPinned, toggleMerchantPin, toggleProductPin } = usePinned();

  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch approved merchants
        const { data: merchantData, error: merchantError } = await supabase
          .from("merchant_profiles")
          .select("*")
          .eq("approval_status", "approved");

        if (merchantError) throw merchantError;
        setMerchants(merchantData || []);

        // Fetch products from approved merchants
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(`
            *,
            merchant_profiles (business_name)
          `)
          .eq("is_active", true);

        if (productError) throw productError;
        setProducts(productData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      );
    }

    const filteredMerchants = activeCategory === "All" 
      ? merchants 
      : merchants.filter(m => m.category === activeCategory);

    const filteredProducts = activeCategory === "All"
      ? products
      : products.filter(p => p.category.toUpperCase() === activeCategory);

    const pinnedMerchantsList = merchants.filter(m => isMerchantPinned(m.id));
    const pinnedProductsList = products.filter(p => isProductPinned(p.id));

    if (activeTab === "merchants") {
      return (
        <div className="space-y-6">
          {pinnedMerchantsList.length > 0 && (
            <div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {pinnedMerchantsList.map((merchant) => (
                  <div 
                    key={merchant.id} 
                    className="flex-shrink-0 w-24 animate-scale-in"
                  >
                    <div className="relative mx-auto mb-2">
                      <div 
                        className="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-jenga-orange cursor-pointer transition-transform duration-200 hover:scale-105 flex items-center justify-center"
                        onClick={() => navigate(`/merchant/${merchant.id}`)}
                      >
                        <span className="text-2xl font-bold text-muted-foreground">
                          {merchant.business_name.charAt(0)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMerchantPin(merchant.id);
                        }}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-jenga-orange flex items-center justify-center shadow-md hover:bg-jenga-orange/80 transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <Pin className="w-3 h-3 text-white fill-white" />
                      </button>
                    </div>
                    <p 
                      className="text-xs text-center text-muted-foreground truncate cursor-pointer"
                      onClick={() => navigate(`/merchant/${merchant.id}`)}
                    >
                      {merchant.business_name}
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

          {filteredMerchants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No merchants found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMerchants.map((merchant) => (
                <div key={merchant.id} onClick={() => navigate(`/merchant/${merchant.id}`)}>
                  <MerchantCard
                    name={merchant.business_name}
                    location={merchant.country_registered}
                    image={merchant.profile_image_url || ""}
                    isPinned={isMerchantPinned(merchant.id)}
                    onPin={() => toggleMerchantPin(merchant.id)}
                    category={merchant.category || undefined}
                    description={merchant.description || undefined}
                  />
                </div>
              ))}
            </div>
          )}
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
                    className="flex-shrink-0 w-24 animate-scale-in"
                  >
                    <div className="relative mx-auto mb-2">
                      <div 
                        className="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-jenga-orange cursor-pointer transition-transform duration-200 hover:scale-105"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {product.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductPin(product.id);
                        }}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-jenga-orange flex items-center justify-center shadow-md hover:bg-jenga-orange/80 transition-all duration-200 hover:scale-110 active:scale-95"
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

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  merchant={product.merchant_profiles?.business_name || "Unknown"}
                  merchantId={product.merchant_id}
                  image={product.image_url || "/placeholder.svg"}
                  itemType={product.item_type as "product" | "service"}
                  isPinned={isProductPinned(product.id)}
                  onPin={() => toggleProductPin(product.id)}
                />
              ))}
            </div>
          )}
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
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button 
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors"
            >
              <Search className="w-5 h-5 text-accent-foreground" />
            </button>
          </div>
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
