import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Mock product data - in real app, fetch from API
const mockProducts = [
  { id: "1", name: "Premium Cement 50kg", price: "TZS 25,000", merchant: "BuildMart", merchantId: "1", category: "Building Materials", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop", description: "High-quality Portland cement suitable for all construction needs. Strong, durable, and meets international standards.", images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop"] },
  { id: "2", name: "Steel Rods 12mm", price: "TZS 18,500", merchant: "IronWorks Co", merchantId: "2", category: "Building Materials", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop", description: "Premium grade steel reinforcement bars for concrete structures.", images: ["https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&h=600&fit=crop"] },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const product = mockProducts.find((p) => p.id === id);

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
              src={product.images[selectedImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {product.images.map((img, idx) => (
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
            <p className="text-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Merchant Link */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Sold by</p>
            <button
              onClick={() => navigate(`/merchant/${product.merchantId}`)}
              className="text-lg font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              {product.merchant}
            </button>
          </div>

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
