import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, X, MapPin, Filter, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "merchants" | "products";
}

interface Merchant {
  id: string;
  business_name: string;
  country_registered: string;
  profile_image_url: string | null;
  category: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number | null;
  category: string;
  image_url: string | null;
  merchant_profiles?: {
    business_name: string;
  };
}

const SearchFilterDialog = ({ open, onOpenChange, type }: SearchFilterDialogProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 3000000]);
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const categories = CATEGORIES;

  // Fetch data when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (type === "merchants") {
          const { data, error } = await supabase
            .from("merchant_profiles")
            .select("id, business_name, country_registered, profile_image_url, category")
            .eq("approval_status", "approved");

          if (!error && data) {
            setMerchants(data);
            const uniqueLocations = [...new Set(data.map(m => m.country_registered).filter(Boolean))];
            setLocations(uniqueLocations);
          }
        } else {
          const { data, error } = await supabase
            .from("products")
            .select(`
              id, name, price, category, image_url,
              merchant_profiles (business_name)
            `)
            .eq("is_active", true);

          if (!error && data) {
            setProducts(data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, type]);

  const filteredResults = useMemo(() => {
    if (type === "merchants") {
      return merchants.filter(merchant => {
        const matchesSearch = merchant.business_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || merchant.category === selectedCategory;
        const matchesLocation = selectedLocation === "All" || merchant.country_registered === selectedLocation;
        return matchesSearch && matchesCategory && matchesLocation;
      });
    } else {
      return products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              product.merchant_profiles?.business_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const price = product.price || 0;
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
      });
    }
  }, [type, searchQuery, selectedCategory, selectedLocation, priceRange, merchants, products]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setPriceRange([0, 3000000]);
  };

  const handleResultClick = (id: string) => {
    onOpenChange(false);
    if (type === "merchants") {
      navigate(`/merchant/${id}`);
    } else {
      navigate(`/product/${id}`);
    }
  };

  const formatPrice = (value: number) => {
    return `${(value / 1000).toFixed(0)}K`;
  };

  const activeFiltersCount = [
    selectedCategory !== "All",
    selectedLocation !== "All" && type === "merchants",
    (priceRange[0] > 0 || priceRange[1] < 3000000) && type === "products"
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search {type === "merchants" ? "Merchants" : "Products"}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Category
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === "merchants" ? (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} Tsh</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={3000000}
                  step={10000}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="w-4 h-4 mr-1" />
              Reset Filters
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 min-h-0 max-h-[40vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {type} found matching your criteria
            </div>
          ) : (
            filteredResults.slice(0, 20).map((item) => {
              if (type === "merchants") {
                const merchant = item as Merchant;
                return (
                  <div
                    key={merchant.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(merchant.id)}
                  >
                    {merchant.profile_image_url ? (
                      <img
                        src={merchant.profile_image_url}
                        alt={merchant.business_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">
                          {merchant.business_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{merchant.business_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {merchant.country_registered}
                        {merchant.category && ` • ${merchant.category}`}
                      </p>
                    </div>
                    {merchant.category && (
                      <Badge variant="secondary">
                        {merchant.category}
                      </Badge>
                    )}
                  </div>
                );
              } else {
                const product = item as Product;
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(product.id)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.merchant_profiles?.business_name} • {product.price?.toLocaleString() || "Quote"} Tsh
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {product.category}
                    </Badge>
                  </div>
                );
              }
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchFilterDialog;