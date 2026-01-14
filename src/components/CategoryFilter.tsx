import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  showDropdown?: boolean;
}

export const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  showDropdown = true 
}: CategoryFilterProps) => {
  return (
    <div className="space-y-3">
      {/* Dropdown Filter */}
      {showDropdown && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={activeCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full max-w-xs bg-card border-border">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {categories.map((category) => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="cursor-pointer"
                >
                  {category === "All" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Horizontal Scroll Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 min-w-fit",
              activeCategory === category
                ? "bg-accent text-accent-foreground shadow-md"
                : "bg-card text-muted-foreground hover:bg-muted border border-border"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
