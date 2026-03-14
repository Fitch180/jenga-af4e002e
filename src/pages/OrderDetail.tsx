import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Clock, CheckCircle, Package, Truck, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrders, OrderStatus } from "@/hooks/useOrders";
import OrderTracker from "@/components/OrderTracker";
import DeliveryTracker from "@/components/DeliveryTracker";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, loading, getOrderById } = useOrders();

  const order = getOrderById(id || "");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Order not found</h2>
          <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "confirmed":
      case "processing":
        return <Package className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <XCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "confirmed":
      case "processing":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "shipped":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
      case "delivered":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "mpesa":
        return "M-Pesa";
      case "airtel":
        return "Airtel Money";
      case "card":
        return "Credit/Debit Card";
      case "cash":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Order Details</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Order Status */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="text-sm font-mono text-foreground">{order.id.slice(0, 8)}...</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-1`}>
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          {order.tracking_number && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
              <p className="font-mono text-foreground">{order.tracking_number}</p>
            </div>
          )}

          {order.merchant_profiles && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Merchant</p>
              <p className="font-medium text-foreground">{order.merchant_profiles.business_name}</p>
            </div>
          )}

          <Separator />

          {/* Order Tracking */}
          {order.status !== "cancelled" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Order Tracking</h3>
              <OrderTracker status={order.status} updatedAt={new Date(order.updated_at)} />
            </div>
          )}
        </Card>

        {/* Order Items */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Order Items</h3>
          <Separator />
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img
                  src={item.product_image || "/placeholder.svg"}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.product_name}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-bold text-accent">{item.price.toLocaleString()} Tsh</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Address */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Delivery Address</h3>
          </div>
          <Separator />
          <div className="space-y-2 text-foreground">
            <p className="font-medium">{order.delivery_full_name}</p>
            <p className="text-muted-foreground">{order.delivery_phone}</p>
            <p className="text-muted-foreground">
              {order.delivery_street}, {order.delivery_district}
            </p>
            <p className="text-muted-foreground">{order.delivery_region}</p>
            {order.delivery_landmark && (
              <p className="text-muted-foreground">Landmark: {order.delivery_landmark}</p>
            )}
          </div>
        </Card>

        {/* Payment & Summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Payment & Summary</h3>
          </div>
          <Separator />
          <p className="text-foreground">{getPaymentMethodLabel(order.payment_method)}</p>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Order Date</span>
              <span>
                {new Date(order.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{order.subtotal.toLocaleString()} Tsh</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>
                {order.delivery_fee > 0 
                  ? `${order.delivery_fee.toLocaleString()} Tsh` 
                  : <span className="italic">Pending</span>
                }
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total Amount</span>
              <span className="text-accent">{order.total_amount.toLocaleString()} Tsh</span>
            </div>
          </div>
        </Card>

        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="w-full"
        >
          Go Back
        </Button>
      </main>
    </div>
  );
};

export default OrderDetail;
