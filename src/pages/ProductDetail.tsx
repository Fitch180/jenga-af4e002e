import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus, Store, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VolumeDiscountBadge from "@/components/VolumeDiscountBadge";

interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string;
  image_url: string | null;
  image_urls: string[] | null;
  item_type: string;
  unit: string;
  merchant_profiles?: {
    id: string;
    business_name: string;
  };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            merchant_profiles (id, business_name)
          `)
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const productImages = product ? [
    product.image_url || "/placeholder.svg",
    ...(product.image_urls || []).filter(url => url && url !== product.image_url),
  ].filter(Boolean) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const displayPrice = product.price 
    ? `${product.price.toLocaleString()} Tsh` 
    : "Request Quote";

  const isService = product.item_type === "service";

  const handleAddToCart = () => {
    if (isService || !product.price) {
      toast.error("This item requires a quotation request");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product.id}-${Date.now()}-${i}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        priceDisplay: displayPrice,
        image: product.image_url || "/placeholder.svg",
        merchant: product.merchant_profiles?.business_name || "Unknown",
        merchantId: product.merchant_id,
      });
    }
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Product Details</h1>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="relative hover:opacity-80 transition-opacity"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
                {totalItems}
              </Badge>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Product Images */}
        <Card className="p-0 overflow-hidden">
          <div className="aspect-video bg-muted">
            <img 
              src={productImages[selectedImage] || "/placeholder.svg"} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {productImages.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? "border-accent" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Product Info */}
        <Card className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
              {product.item_type === "service" && (
                <span className="text-xs bg-jenga-orange/10 text-jenga-orange px-2 py-0.5 rounded-full font-medium">
                  Service
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>

          <div className="text-3xl font-bold text-accent">{displayPrice}</div>

          {/* Volume Discounts */}
          {product.price && (
            <VolumeDiscountBadge
              productId={product.id}
              basePrice={product.price}
              quantity={quantity}
              showTiers={true}
            />
          )}

          {product.description && (
            <div className="pt-4 border-t border-border">
              <p className="text-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Merchant Link */}
          {product.merchant_profiles && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Sold by</p>
              <button
                onClick={() => navigate(`/merchant/${product.merchant_profiles?.id}`)}
                className="flex items-center gap-2 text-lg font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                <Store className="w-5 h-5" />
                {product.merchant_profiles.business_name}
              </button>
            </div>
          )}

          {/* Quantity Selector - Only for products with price (not services) */}
          {product.price && !isService && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 border border-border rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">per {product.unit}</span>
              </div>
            </div>
          )}

          {/* Add to Cart or Request Quotation */}
          {isService || !product.price ? (
            <Button
              onClick={() => navigate(`/merchant/${product.merchant_id}`)}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-lg"
            >
              Request Quotation
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          )}
        </Card>
      </main>
    </div>
  );
}
