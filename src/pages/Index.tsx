import { useState } from "react";
import { Search } from "lucide-react";
import { MerchantCard } from "@/components/MerchantCard";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BottomNav } from "@/components/BottomNav";

const CATEGORIES = [
  "All",
  "BUILDING",
  "PLUMBING",
  "FLOORING",
  "ELECTRICAL",
  "PAINTING",
  "TILES",
  "FURNITURE",
  "LIGHTING",
  "DECOR",
];

const MERCHANTS = [
  {
    id: 1,
    name: "Dar Ceramica Center",
    location: "Mikocheni",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "ABC Emporio Tiles Tanzania",
    location: "Industrial Way Rd",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Elite Hardware Supplies",
    location: "Msasani",
    image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Modern Living Furniture",
    location: "Masaki",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop",
  },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Light Lamp Shades",
    merchant: "Dar Ceramica Center",
    price: "25,000 Tsh",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Tiles Silex Dune 1.42",
    merchant: "ABC Emporio",
    price: "25,000 Tsh",
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Premium Wall Paint",
    merchant: "Elite Hardware",
    price: "45,000 Tsh",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Modern Sofa Set",
    merchant: "Modern Living",
    price: "1,500,000 Tsh",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("merchants");
  const [activeCategory, setActiveCategory] = useState("All");
  const [pinnedMerchants, setPinnedMerchants] = useState<number[]>([]);
  const [pinnedProducts, setPinnedProducts] = useState<number[]>([]);

  const toggleMerchantPin = (id: number) => {
    setPinnedMerchants((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleProductPin = (id: number) => {
    setPinnedProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderContent = () => {
    if (activeTab === "merchants") {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Featured Merchants</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {MERCHANTS.slice(0, 3).map((merchant) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MERCHANTS.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                {...merchant}
                isPinned={pinnedMerchants.includes(merchant.id)}
                onPin={() => toggleMerchantPin(merchant.id)}
              />
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
              {PRODUCTS.slice(0, 3).map((product) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRODUCTS.map((product) => (
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

    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {activeTab === "merchants" ? "Featured Merchants" : "Featured Products"}
          </h1>
          <button className="w-14 h-14 rounded-full bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg">
            <Search className="w-6 h-6 text-accent-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
