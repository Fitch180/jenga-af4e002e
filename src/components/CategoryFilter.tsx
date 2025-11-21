import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-300 min-w-fit",
            activeCategory === category
              ? "bg-accent text-accent-foreground shadow-md"
              : "bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
