import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Smartphone, Loader2, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useOrders, PaymentMethod, DeliveryAddress } from "@/hooks/useOrders";
import { toast } from "sonner";

type FulfillmentMethod = "pickup" | "delivery";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    region: "",
    district: "",
    street: "",
    landmark: "",
  });

  // Refs for scrolling to missing fields
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLInputElement>(null);
  const districtRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    if (fulfillment === "delivery") {
      // Find and scroll to first empty required field
      if (!address.fullName) {
        toast.error("Please enter your full name");
        fullNameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        fullNameRef.current?.focus();
        return false;
      }
      if (!address.phone) {
        toast.error("Please enter your phone number");
        phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneRef.current?.focus();
        return false;
      }
      if (!address.region) {
        toast.error("Please enter your region");
        regionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        regionRef.current?.focus();
        return false;
      }
      if (!address.district) {
        toast.error("Please enter your district");
        districtRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        districtRef.current?.focus();
        return false;
      }
      if (!address.street) {
        toast.error("Please enter your street address");
        streetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        streetRef.current?.focus();
        return false;
      }
    }
    return true;
  };

  // Group items by merchant
  const itemsByMerchant = items.reduce((acc, item) => {
    const merchantId = item.merchantId;
    if (!acc[merchantId]) {
      acc[merchantId] = {
        merchantId,
        merchantName: item.merchant,
        items: [],
        subtotal: 0,
      };
    }
    acc[merchantId].items.push(item);
    acc[merchantId].subtotal += item.price * item.quantity;
    return acc;
  }, {} as Record<string, { merchantId: string; merchantName: string; items: typeof items; subtotal: number }>);

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const merchantGroups = Object.values(itemsByMerchant);
      const orderIds: string[] = [];

      const deliveryAddress: DeliveryAddress = fulfillment === "pickup"
        ? { fullName: "Store Pickup", phone: "", region: "", district: "", street: "Store Pickup" }
        : address;

      for (const group of merchantGroups) {
        const orderData = {
          merchant_id: group.merchantId,
          payment_method: paymentMethod,
          subtotal: group.subtotal,
          delivery_fee: 0,
          total_amount: group.subtotal,
          delivery_address: deliveryAddress,
          items: group.items.map(item => ({
            product_id: item.productId,
            product_name: item.name,
            product_image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
        };

        const orderId = await createOrder(orderData);
        if (orderId) {
          orderIds.push(orderId);
        }
      }

      if (orderIds.length > 0) {
        clearCart();
        if (orderIds.length === 1) {
          navigate(`/orders/${orderIds[0]}`);
        } else {
          navigate("/orders");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Fulfillment Method Toggle */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFulfillment("pickup")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                fulfillment === "pickup"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Store className="w-5 h-5" />
              On Store Pickup
            </button>
            <button
              onClick={() => setFulfillment("delivery")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                fulfillment === "delivery"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Truck className="w-5 h-5" />
              Delivery
            </button>
          </div>
        </Card>

        {/* Delivery Address - only shown when delivery is selected */}
        {fulfillment === "delivery" && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Delivery Address</h2>
            <Separator />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    ref={fullNameRef}
                    id="fullName"
                    placeholder="John Doe"
                    value={address.fullName}
                    onChange={(e) => handleAddressChange("fullName", e.target.value)}
                    className={!address.fullName && fulfillment === "delivery" ? "border-destructive/50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    ref={phoneRef}
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
                    ref={regionRef}
                    id="region"
                    placeholder="Dar es Salaam"
                    value={address.region}
                    onChange={(e) => handleAddressChange("region", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    ref={districtRef}
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
                  ref={streetRef}
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
        )}

        {/* Pickup Info */}
        {fulfillment === "pickup" && (
          <Card className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-foreground">Store Pickup</h2>
            <Separator />
            <p className="text-sm text-muted-foreground">
              You will pick up your order directly from the merchant's store. The merchant will notify you when your order is ready for collection.
            </p>
          </Card>
        )}

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

              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-semibold">{fulfillment === "pickup" ? "Pay at Store" : "Cash on Delivery"}</p>
                    <p className="text-sm text-muted-foreground">
                      {fulfillment === "pickup" ? "Pay when you pick up your order" : "Pay when you receive your order"}
                    </p>
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
          
          <div className="space-y-6">
            {Object.values(itemsByMerchant).map((group) => (
              <div key={group.merchantId} className="space-y-3">
                <p className="font-medium text-foreground">{group.merchantName}</p>
                {group.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm pl-4">
                    <span className="text-muted-foreground">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      {(item.price * item.quantity).toLocaleString()} Tsh
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pl-4 border-t pt-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{group.subtotal.toLocaleString()} Tsh</span>
                </div>
                {fulfillment === "delivery" && (
                  <div className="flex justify-between text-sm pl-4 text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="italic">To be set by merchant</span>
                  </div>
                )}
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total{fulfillment === "delivery" ? " (excluding delivery)" : ""}</span>
              <span>{totalPrice.toLocaleString()} Tsh</span>
            </div>
            {fulfillment === "delivery" && (
              <p className="text-xs text-muted-foreground">
                Note: Delivery fees will be added by each merchant after order confirmation.
              </p>
            )}
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order${Object.keys(itemsByMerchant).length > 1 ? 's' : ''}`
            )}
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default Checkout;
