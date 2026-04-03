import { useState } from "react";
import { Package, ShoppingCart, CheckCircle, XCircle, Truck, DollarSign, Clock, MapPin, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Order, OrderStatus } from "@/hooks/useOrders";
import { useDeliveryTracking } from "@/hooks/useDeliveryTracking";
import { toast } from "sonner";

interface OrderProcessingTabProps {
  orders: Order[];
  loading: boolean;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  updateDeliveryFee: (orderId: string, fee: number) => Promise<boolean>;
  updateTrackingNumber?: (orderId: string, trackingNumber: string) => Promise<boolean>;
}

const STATUS_FILTERS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const getOrderStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    pending: "outline",
    confirmed: "secondary",
    processing: "secondary",
    shipped: "default",
    delivered: "default",
    cancelled: "destructive",
  };
  return variants[status] || "outline";
};

export default function OrderProcessingTab({
  orders,
  loading,
  updateOrderStatus,
  updateDeliveryFee,
  updateTrackingNumber,
}: OrderProcessingTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryFeeDialogOpen, setDeliveryFeeDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState("");
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackingNote, setTrackingNote] = useState("");
  const [trackingLocation, setTrackingLocation] = useState("");
  const [trackingNumberDialogOpen, setTrackingNumberDialogOpen] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [trackingNumberOrderId, setTrackingNumberOrderId] = useState<string | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const { history, addTrackingUpdate } = useDeliveryTracking(trackingOrderId || detailOrder?.id || null);

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSetDeliveryFee = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDeliveryFeeInput("");
    setDeliveryFeeDialogOpen(true);
  };

  const handleConfirmDeliveryFee = async () => {
    if (!selectedOrderId || !deliveryFeeInput) return;
    const fee = parseFloat(deliveryFeeInput);
    if (isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid delivery fee");
      return;
    }
    await updateDeliveryFee(selectedOrderId, fee);
    setDeliveryFeeDialogOpen(false);
  };

  const handleProcessOrder = async (orderId: string, status: OrderStatus) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      // Also add to tracking history
      await addTrackingUpdate(orderId, status, `Order status changed to ${status}`);
    }
  };

  const handleOpenTracking = (orderId: string) => {
    setTrackingOrderId(orderId);
    setTrackingNote("");
    setTrackingLocation("");
    setTrackingDialogOpen(true);
  };

  const handleAddTrackingNote = async () => {
    if (!trackingOrderId || !trackingNote.trim()) return;
    const order = orders.find((o) => o.id === trackingOrderId);
    const success = await addTrackingUpdate(
      trackingOrderId,
      order?.status || "processing",
      trackingNote,
      trackingLocation || undefined
    );
    if (success) {
      toast.success("Tracking update added!");
      setTrackingNote("");
      setTrackingLocation("");
      setTrackingDialogOpen(false);
    }
  };

  const handleViewDetail = (order: Order) => {
    setDetailOrder(order);
    setOrderDetailOpen(true);
  };

  const handleSetTrackingNumber = (orderId: string, currentNumber: string | null) => {
    setTrackingNumberOrderId(orderId);
    setTrackingNumberInput(currentNumber || "");
    setTrackingNumberDialogOpen(true);
  };

  const handleConfirmTrackingNumber = async () => {
    if (!trackingNumberOrderId || !trackingNumberInput.trim() || !updateTrackingNumber) return;
    await updateTrackingNumber(trackingNumberOrderId, trackingNumberInput.trim());
    setTrackingNumberDialogOpen(false);
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3 animate-pulse" />
        <p className="text-muted-foreground">Loading orders...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Customer Orders</h2>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label} {f.value !== "all" && statusCounts[f.value] ? `(${statusCounts[f.value]})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
            className={`p-2 rounded-lg text-center transition-colors ${
              statusFilter === s
                ? "bg-accent text-accent-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <p className="text-lg font-bold">{statusCounts[s] || 0}</p>
            <p className="text-xs capitalize">{s}</p>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {statusFilter === "all" ? "No orders yet." : `No ${statusFilter} orders.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_full_name}</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getOrderStatusBadge(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <p className="font-bold text-foreground">{order.total_amount.toLocaleString()} Tsh</p>
                    {order.delivery_fee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        (incl. {order.delivery_fee.toLocaleString()} Tsh delivery)
                      </p>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method === "airtel" ? "Airtel" : order.payment_method === "card" ? "Card" : "Cash"}
                    </Badge>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="text-foreground">{(item.price * item.quantity).toLocaleString()} Tsh</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Delivery:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_street}, {order.delivery_district}, {order.delivery_region}
                  </p>
                  {order.delivery_landmark && (
                    <p className="text-xs text-muted-foreground">Landmark: {order.delivery_landmark}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  {order.status === "pending" && (
                    <>
                      {order.delivery_fee === 0 && (
                        <Button size="sm" variant="outline" onClick={() => handleSetDeliveryFee(order.id)}>
                          <DollarSign className="w-4 h-4 mr-1" />
                          Set Delivery Fee
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleProcessOrder(order.id, "confirmed")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleProcessOrder(order.id, "cancelled")}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {order.status === "confirmed" && (
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => handleProcessOrder(order.id, "processing")}
                    >
                      <Package className="w-4 h-4 mr-1" />
                      Start Processing
                    </Button>
                  )}
                  {order.status === "processing" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleProcessOrder(order.id, "shipped")}
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Mark Shipped
                      </Button>
                      {updateTrackingNumber && (
                        <Button size="sm" variant="outline" onClick={() => handleSetTrackingNumber(order.id, order.tracking_number)}>
                          <Truck className="w-4 h-4 mr-1" />
                          {order.tracking_number ? "Update Tracking #" : "Set Tracking #"}
                        </Button>
                      )}
                    </>
                  )}
                  {order.status === "shipped" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleProcessOrder(order.id, "delivered")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Delivered
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleOpenTracking(order.id)}>
                        <MapPin className="w-4 h-4 mr-1" />
                        Add Tracking Update
                      </Button>
                      {updateTrackingNumber && (
                        <Button size="sm" variant="outline" onClick={() => handleSetTrackingNumber(order.id, order.tracking_number)}>
                          <Truck className="w-4 h-4 mr-1" />
                          Update Tracking #
                        </Button>
                      )}
                    </>
                  )}
                  {(order.status === "processing" || order.status === "shipped") && (
                    <Button size="sm" variant="outline" onClick={() => handleOpenTracking(order.id)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Add Note
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleViewDetail(order)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delivery Fee Dialog */}
      <Dialog open={deliveryFeeDialogOpen} onOpenChange={setDeliveryFeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Delivery Fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Delivery Fee (Tsh)</Label>
              <Input
                type="number"
                placeholder="Enter delivery fee"
                value={deliveryFeeInput}
                onChange={(e) => setDeliveryFeeInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryFeeDialogOpen(false)}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleConfirmDeliveryFee}>
              Set Fee & Notify Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Update Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Delivery Tracking Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Update Note *</Label>
              <Textarea
                placeholder="e.g., Package picked up from warehouse, Out for delivery..."
                value={trackingNote}
                onChange={(e) => setTrackingNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <Input
                placeholder="e.g., Dar es Salaam Distribution Center"
                value={trackingLocation}
                onChange={(e) => setTrackingLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleAddTrackingNote}
              disabled={!trackingNote.trim()}
            >
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Number Dialog */}
      <Dialog open={trackingNumberDialogOpen} onOpenChange={setTrackingNumberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Tracking Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tracking Number</Label>
              <Input
                placeholder="e.g., TRK-2026-ABC123"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This number will be visible to the customer for tracking their delivery.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingNumberDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleConfirmTrackingNumber}
              disabled={!trackingNumberInput.trim()}
            >
              Save Tracking Number
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{detailOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={getOrderStatusBadge(detailOrder.status)}>
                    {detailOrder.status.charAt(0).toUpperCase() + detailOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{detailOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <Badge variant={detailOrder.payment_status === "paid" ? "default" : "outline"}>
                    {detailOrder.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Tracking #</p>
                  <p className="font-mono text-xs">{detailOrder.tracking_number || "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="font-medium text-foreground mb-2">Customer</p>
                <p className="text-sm">{detailOrder.delivery_full_name}</p>
                <p className="text-sm text-muted-foreground">{detailOrder.delivery_phone}</p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-2">Delivery Address</p>
                <p className="text-sm text-muted-foreground">
                  {detailOrder.delivery_street}, {detailOrder.delivery_district}, {detailOrder.delivery_region}
                </p>
                {detailOrder.delivery_landmark && (
                  <p className="text-sm text-muted-foreground">Landmark: {detailOrder.delivery_landmark}</p>
                )}
              </div>

              <Separator />

              <div>
                <p className="font-medium text-foreground mb-2">Items</p>
                {detailOrder.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()} Tsh</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{detailOrder.subtotal.toLocaleString()} Tsh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>{detailOrder.delivery_fee > 0 ? `${detailOrder.delivery_fee.toLocaleString()} Tsh` : "Pending"}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                  <span>Total</span>
                  <span className="text-accent">{detailOrder.total_amount.toLocaleString()} Tsh</span>
                </div>
              </div>

              {/* Delivery Timeline */}
              {history.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium text-foreground mb-3">Delivery Timeline</p>
                    <div className="space-y-3">
                      {history.map((entry, i) => (
                        <div key={entry.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${i === history.length - 1 ? "bg-accent" : "bg-muted-foreground/50"}`} />
                            {i < history.length - 1 && <div className="w-0.5 h-full bg-border" />}
                          </div>
                          <div className="pb-3">
                            <p className="text-sm font-medium capitalize">{entry.status}</p>
                            {entry.note && <p className="text-sm text-muted-foreground">{entry.note}</p>}
                            {entry.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {entry.location}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.created_at).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
