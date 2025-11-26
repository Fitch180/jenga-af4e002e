import { CheckCircle, Circle, Clock, Package, Truck, Home } from "lucide-react";
import { OrderStatus } from "@/contexts/OrderContext";

interface OrderTrackerProps {
  status: OrderStatus;
  updatedAt?: Date;
}

const ORDER_STEPS = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Home }
];

const getStatusIndex = (status: OrderStatus): number => {
  if (status === "cancelled") return -1;
  const index = ORDER_STEPS.findIndex(s => s.status === status);
  return index >= 0 ? index : 0;
};

const OrderTracker = ({ status, updatedAt }: OrderTrackerProps) => {
  const currentIndex = getStatusIndex(status);

  if (status === "cancelled") {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
        <p className="text-destructive font-medium">Order Cancelled</p>
        {updatedAt && (
          <p className="text-sm text-muted-foreground mt-1">
            Cancelled on {updatedAt.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {ORDER_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} className="flex flex-col items-center flex-1">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? isCurrent
                        ? "bg-accent text-accent-foreground ring-4 ring-accent/20"
                        : "bg-accent/80 text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < ORDER_STEPS.length - 1 && (
                  <div
                    className={`absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 ${
                      index < currentIndex ? "bg-accent" : "bg-muted"
                    }`}
                    style={{ width: "calc(100% - 2.5rem)", marginLeft: "0.25rem" }}
                  />
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center ${
                  isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {updatedAt && (
        <p className="text-sm text-muted-foreground text-center">
          Last updated: {updatedAt.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}
    </div>
  );
};

export default OrderTracker;
