import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Clock, CheckCircle, Package, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrders, OrderStatus } from "@/contexts/OrderContext";
import OrderTracker from "@/components/OrderTracker";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();

  const order = getOrderById(id || "");

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
              <p className="text-lg font-semibold text-foreground">{order.id}</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-1`}>
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          {order.trackingNumber && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
              <p className="font-mono text-foreground">{order.trackingNumber}</p>
            </div>
          )}

          <Separator />

          {/* Order Tracking */}
          {order.status !== "cancelled" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Order Tracking</h3>
              <OrderTracker status={order.status} updatedAt={order.updatedAt} />
            </div>
          )}
        </Card>

        {/* Order Items */}
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Order Items</h3>
          <Separator />
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.merchant}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-bold text-accent">{item.price}</p>
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
            <p className="font-medium">{order.deliveryAddress.fullName}</p>
            <p className="text-muted-foreground">{order.deliveryAddress.phone}</p>
            <p className="text-muted-foreground">
              {order.deliveryAddress.street}, {order.deliveryAddress.district}
            </p>
            <p className="text-muted-foreground">{order.deliveryAddress.region}</p>
            {order.deliveryAddress.landmark && (
              <p className="text-muted-foreground">Landmark: {order.deliveryAddress.landmark}</p>
            )}
          </div>
        </Card>

        {/* Payment & Summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">Payment Method</h3>
          </div>
          <Separator />
          <p className="text-foreground">{getPaymentMethodLabel(order.paymentMethod)}</p>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Order Date</span>
              <span>
                {order.createdAt.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total Amount</span>
              <span className="text-accent">{order.totalAmount.toLocaleString()} Tsh</span>
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
