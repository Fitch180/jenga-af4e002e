import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useOrders, PaymentMethod, DeliveryAddress } from "@/contexts/OrderContext";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    region: "",
    district: "",
    street: "",
    landmark: "",
  });

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!address.fullName || !address.phone || !address.region || !address.district || !address.street) {
      toast.error("Please fill in all required delivery address fields");
      return false;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;

    const orderItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      merchant: item.merchant,
    }));

    const orderId = createOrder(orderItems, address, paymentMethod, totalPrice);
    clearCart();
    toast.success("Order placed successfully!");
    navigate(`/orders/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate("/cart")}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Checkout</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to your cart to checkout</p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Delivery Address */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Delivery Address</h2>
          <Separator />
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={address.fullName}
                  onChange={(e) => handleAddressChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+255 754 123 456"
                  value={address.phone}
                  onChange={(e) => handleAddressChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Input
                  id="region"
                  placeholder="Dar es Salaam"
                  value={address.region}
                  onChange={(e) => handleAddressChange("region", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  placeholder="Kinondoni"
                  value={address.district}
                  onChange={(e) => handleAddressChange("district", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                placeholder="123 Main Street"
                value={address.street}
                onChange={(e) => handleAddressChange("street", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="Near XYZ Mall"
                value={address.landmark || ""}
                onChange={(e) => handleAddressChange("landmark", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Payment Method</h2>
          <Separator />
          
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Smartphone className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold">M-Pesa</p>
                    <p className="text-sm text-muted-foreground">Pay with M-Pesa mobile money</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="airtel" id="airtel" />
                <Label htmlFor="airtel" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Smartphone className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold">Airtel Money</p>
                    <p className="text-sm text-muted-foreground">Pay with Airtel Money mobile money</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or other cards</p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </Card>

        {/* Order Summary */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
          <Separator />
          
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium">
                  {(parseInt(item.price.replace(/[^0-9]/g, "")) * item.quantity).toLocaleString()} Tsh
                </span>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span>{totalPrice.toLocaleString()} Tsh</span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-lg"
          >
            Place Order
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default Checkout;
