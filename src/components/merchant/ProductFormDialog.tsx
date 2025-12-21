import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { CATEGORIES } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: string;
}

type ItemType = "product" | "service";

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  description?: string;
  image: string;
  variants?: ProductVariant[];
  itemType?: ItemType;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, "id"> & { id?: string }) => void;
}

const ProductFormDialog = ({ open, onOpenChange, product, onSave }: ProductFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    itemType: "product" as ItemType,
  });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState({ name: "", value: "", priceModifier: "" });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.replace(" Tsh", "").replace(/,/g, ""),
        category: product.category,
        description: product.description || "",
        image: product.image,
        itemType: product.itemType || "product",
      });
      setVariants(product.variants || []);
    } else {
      setFormData({ name: "", price: "", category: "", description: "", image: "", itemType: "product" });
      setVariants([]);
    }
  }, [product, open]);

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.value) {
      setVariants([
        ...variants,
        { ...newVariant, id: Date.now().toString() },
      ]);
      setNewVariant({ name: "", value: "", priceModifier: "" });
    }
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(formData.price.replace(/,/g, ""));
    const formattedPrice = `${priceNum.toLocaleString()} Tsh`;
    
    onSave({
      ...(product?.id && { id: product.id }),
      name: formData.name,
      price: formattedPrice,
      category: formData.category,
      description: formData.description,
      image: formData.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop",
      variants: variants.length > 0 ? variants : undefined,
      itemType: formData.itemType,
    });
    onOpenChange(false);
  };

  const categories = CATEGORIES.filter((c) => c !== "All");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {product ? `Edit ${formData.itemType === "service" ? "Service" : "Product"}` : "Add New Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Type Selection */}
          <div className="space-y-2">
            <Label>Item Type *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.itemType === "product" ? "default" : "outline"}
                className={formData.itemType === "product" ? "bg-primary" : ""}
                onClick={() => setFormData({ ...formData, itemType: "product" })}
              >
                Product
              </Button>
              <Button
                type="button"
                variant={formData.itemType === "service" ? "default" : "outline"}
                className={formData.itemType === "service" ? "bg-jenga-orange hover:bg-jenga-orange/90" : ""}
                onClick={() => setFormData({ ...formData, itemType: "service" })}
              >
                Service
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.itemType === "product" 
                ? "Products can be added to cart and purchased directly" 
                : "Services require customers to request a quotation"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{formData.itemType === "service" ? "Service" : "Product"} Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={formData.itemType === "service" ? "Enter service name" : "Enter product name"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (Tsh) *</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 50000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
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

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          {/* Variants Section */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">Product Variants</Label>
            
            {variants.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {variants.map((variant) => (
                  <Badge
                    key={variant.id}
                    variant="secondary"
                    className="flex items-center gap-1 py-1"
                  >
                    <span>{variant.name}: {variant.value}</span>
                    {variant.priceModifier && (
                      <span className="text-muted-foreground">
                        (+{variant.priceModifier} Tsh)
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Variant name (e.g., Size)"
                value={newVariant.name}
                onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
              />
              <Input
                placeholder="Value (e.g., Large)"
                value={newVariant.value}
                onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
              />
              <Input
                placeholder="Price modifier"
                value={newVariant.priceModifier}
                onChange={(e) => setNewVariant({ ...newVariant, priceModifier: e.target.value })}
              />
              <Button type="button" variant="outline" onClick={handleAddVariant}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {product 
                ? `Update ${formData.itemType === "service" ? "Service" : "Product"}` 
                : `Add ${formData.itemType === "service" ? "Service" : "Product"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
