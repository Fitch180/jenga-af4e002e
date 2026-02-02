import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  onCategoryChange
}: CategoryFilterProps) => {
  return (
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
  );
};
