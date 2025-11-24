import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrders, OrderStatus } from "@/contexts/OrderContext";

const Orders = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();

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

  const getStatusLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">My Orders</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Package className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping and your orders will appear here
          </p>
          <Button onClick={() => navigate("/")}>Start Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">My Orders ({orders.length})</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            <div className="space-y-4">
              {/* Order Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold text-foreground">{order.id}</p>
                </div>
                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              {/* Order Items Preview */}
              <div className="space-y-2">
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} • {item.price}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-sm text-muted-foreground">
                    + {order.items.length - 2} more item(s)
                  </p>
                )}
              </div>

              {/* Order Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold text-accent">
                    {order.totalAmount.toLocaleString()} Tsh
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Order Date</p>
                  <p className="text-sm text-foreground">
                    {order.createdAt.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default Orders;
