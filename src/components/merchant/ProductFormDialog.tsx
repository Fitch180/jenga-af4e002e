import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CATEGORIES, SERVICE_CATEGORIES } from "@/data/mockData";
import { Product, ProductFormData } from "@/hooks/useProducts";
import { X, Plus, Image as ImageIcon } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: ProductFormData, productId?: string) => Promise<boolean>;
  saving?: boolean;
}

const ProductFormDialog = ({ open, onOpenChange, product, onSave, saving }: ProductFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image_url: "",
    image_urls: [] as string[],
    stock: "",
    unit: "item",
    is_active: true,
    item_type: "product" as "product" | "service",
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price?.toString() || "",
        category: product.category,
        description: product.description || "",
        image_url: product.image_url || "",
        image_urls: product.image_urls || [],
        stock: product.stock.toString(),
        unit: product.unit,
        is_active: product.is_active,
        item_type: product.item_type || "product",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        category: "",
        description: "",
        image_url: "",
        image_urls: [],
        stock: "0",
        unit: "item",
        is_active: true,
        item_type: "product",
      });
    }
    setNewImageUrl("");
  }, [product, open]);

  const handleAddImage = () => {
    if (newImageUrl.trim() && formData.image_urls.length < 5) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, newImageUrl.trim()],
      });
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter((_, i) => i !== index),
    });
  };

  const isService = formData.item_type === "service";
  const priceRequired = !isService;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let priceNum: number | null = null;
    if (formData.price) {
      priceNum = parseFloat(formData.price.replace(/,/g, ""));
      if (isNaN(priceNum)) {
        priceNum = null;
      }
    }

    // Price is required for products, optional for services
    if (priceRequired && (priceNum === null || priceNum <= 0)) {
      return;
    }

    const productData: ProductFormData = {
      name: formData.name.trim(),
      price: priceNum,
      category: formData.category,
      description: formData.description.trim() || undefined,
      image_url: formData.image_urls[0] || formData.image_url.trim() || undefined,
      image_urls: formData.image_urls,
      stock: parseInt(formData.stock) || 0,
      unit: formData.unit,
      is_active: formData.is_active,
      item_type: formData.item_type,
    };
    
    const success = await onSave(productData, product?.id);
    if (success) {
      onOpenChange(false);
    }
  };

  const categories = CATEGORIES.filter((c) => c !== "All");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {product ? `Edit ${isService ? "Service" : "Product"}` : `Add New ${isService ? "Service" : "Product"}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Type Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={formData.item_type === "product" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setFormData({ ...formData, item_type: "product" })}
            >
              Product
            </Button>
            <Button
              type="button"
              variant={formData.item_type === "service" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setFormData({ ...formData, item_type: "service" })}
            >
              Service
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{isService ? "Service" : "Product"} Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Enter ${isService ? "service" : "product"} name`}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Price (Tsh) {priceRequired ? "*" : "(Optional)"}
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder={isService ? "Leave empty for quote-based" : "e.g., 50000"}
                required={priceRequired}
              />
              {isService && (
                <p className="text-xs text-muted-foreground">
                  Leave empty if price requires quotation
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                      {SERVICE_CATEGORIES.includes(cat) && " (Service)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isService && (
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="e.g., 100"
                />
              </div>
            )}

            {!isService && (
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="l">Liter (L)</SelectItem>
                    <SelectItem value="ml">Milliliter (ml)</SelectItem>
                    <SelectItem value="sqm">Square Meter (sqm)</SelectItem>
                    <SelectItem value="m">Meter (m)</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="bag">Bag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Multi-Image Upload Section */}
          <div className="space-y-2">
            <Label>Images (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste image URL and click Add"
                type="url"
                disabled={formData.image_urls.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddImage}
                disabled={!newImageUrl.trim() || formData.image_urls.length >= 5}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.image_urls.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
                {formData.image_urls.length < 5 && (
                  <div className="w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
            )}
            
            {formData.image_urls.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add up to 5 images. The first image will be the main display image.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={`${isService ? "Service" : "Product"} description...`}
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Active {isService ? "services" : "products"} are visible to customers
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={saving || !formData.name || (priceRequired && !formData.price) || !formData.category}
            >
              {saving ? "Saving..." : product ? `Update ${isService ? "Service" : "Product"}` : `Add ${isService ? "Service" : "Product"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;