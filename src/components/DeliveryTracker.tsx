import { MapPin, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { useDeliveryTracking, StatusHistoryEntry } from "@/hooks/useDeliveryTracking";
import { OrderStatus } from "@/hooks/useOrders";

interface DeliveryTrackerProps {
  orderId: string;
  status: OrderStatus;
  trackingNumber: string | null;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

const DeliveryTracker = ({ orderId, status, trackingNumber }: DeliveryTrackerProps) => {
  const { history, loading } = useDeliveryTracking(orderId);

  return (
    <div className="space-y-4">
      {trackingNumber && (
        <div className="bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Tracking Number</p>
          <p className="font-mono text-sm font-medium text-foreground">{trackingNumber}</p>
        </div>
      )}

      {history.length > 0 ? (
        <div className="space-y-0">
          {[...history].reverse().map((entry, i) => {
            const Icon = STATUS_ICONS[entry.status] || Package;
            const isLatest = i === 0;

            return (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isLatest
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {i < history.length - 1 && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-medium capitalize ${isLatest ? "text-foreground" : "text-muted-foreground"}`}>
                    {entry.status}
                  </p>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground">{entry.note}</p>
                  )}
                  {entry.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {entry.location}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(entry.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          {loading ? "Loading tracking updates..." : "No detailed tracking updates yet."}
        </p>
      )}
    </div>
  );
};

export default DeliveryTracker;
