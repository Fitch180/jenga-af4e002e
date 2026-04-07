import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { BottomNav } from "@/components/BottomNav";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    // Navigate to checkout page (to be implemented)
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Shopping Cart</h1>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
        <BottomNav activeTab="cart" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Shopping Cart</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Browse our products and add items to your cart
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
        <BottomNav activeTab="cart" onTabChange={(tab) => { if (tab === "merchants" || tab === "products") navigate("/"); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Shopping Cart ({totalItems})</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            Clear All
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.productId} className="p-4">
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.merchant}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-accent">{item.price}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({totalItems} items)</span>
              <span>{totalPrice.toLocaleString()} Tsh</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>To be calculated</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span>{totalPrice.toLocaleString()} Tsh</span>
            </div>
          </div>
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </Button>
        </Card>
      </main>
      <BottomNav activeTab="cart" onTabChange={(tab) => { if (tab === "merchants" || tab === "products") navigate("/"); }} />
    </div>
  );
};

export default Cart;
