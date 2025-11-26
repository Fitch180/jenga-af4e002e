import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, X, MapPin, Filter } from "lucide-react";
import { CATEGORIES, MERCHANTS, PRODUCTS } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

interface SearchFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "merchants" | "products";
}

const LOCATIONS = [...new Set(MERCHANTS.map(m => m.location))];

const SearchFilterDialog = ({ open, onOpenChange, type }: SearchFilterDialogProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 3000000]);

  const categories = CATEGORIES;

  const parsePrice = (price: string) => {
    return parseInt(price.replace(/,/g, "").replace(" Tsh", ""));
  };

  const filteredResults = useMemo(() => {
    if (type === "merchants") {
      return MERCHANTS.filter(merchant => {
        const matchesSearch = merchant.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || merchant.category === selectedCategory;
        const matchesLocation = selectedLocation === "All" || merchant.location === selectedLocation;
        return matchesSearch && matchesCategory && matchesLocation;
      });
    } else {
      return PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              product.merchant.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const price = parsePrice(product.price);
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
      });
    }
  }, [type, searchQuery, selectedCategory, selectedLocation, priceRange]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLocation("All");
    setPriceRange([0, 3000000]);
  };

  const handleResultClick = (id: string | number) => {
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
                    {LOCATIONS.map((loc) => (
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
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {type} found matching your criteria
            </div>
          ) : (
            filteredResults.slice(0, 20).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleResultClick(item.id)}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {type === "merchants" 
                      ? `${(item as typeof MERCHANTS[0]).location} • ${(item as typeof MERCHANTS[0]).category}`
                      : `${(item as typeof PRODUCTS[0]).merchant} • ${(item as typeof PRODUCTS[0]).price}`
                    }
                  </p>
                </div>
                {type === "products" && (
                  <Badge variant="secondary">
                    {(item as typeof PRODUCTS[0]).category}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchFilterDialog;
