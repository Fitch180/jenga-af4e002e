import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PRODUCTS, MERCHANTS } from "@/data/mockData";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const product = PRODUCTS.find((p) => p.id === id);
  const merchant = product ? MERCHANTS.find((m) => m.id === product.merchantId) : null;
  
  const productImages = product ? [
    product.image,
    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=600&fit=crop",
  ] : [];

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    toast({
      title: "Added to Cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Product Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Product Images */}
        <Card className="p-0 overflow-hidden">
          <div className="aspect-video bg-muted">
            <img 
              src={productImages[selectedImage]} 
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
            <h2 className="text-2xl font-bold text-foreground mb-2">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>

          <div className="text-3xl font-bold text-accent">{product.price}</div>

          <div className="pt-4 border-t border-border">
            <p className="text-foreground leading-relaxed">
              Premium quality product with modern design. Perfect for residential and commercial projects.
            </p>
          </div>

          {/* Merchant Link */}
          {merchant && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Sold by</p>
              <button
                onClick={() => navigate(`/merchant/${merchant.id}`)}
                className="flex items-center gap-2 text-lg font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                <Store className="w-5 h-5" />
                {merchant.name}
              </button>
            </div>
          )}

          {/* Quantity Selector */}
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
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </Card>
      </main>
    </div>
  );
}
