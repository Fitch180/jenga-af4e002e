import { useState } from "react";
import { FileText, Send, CheckCircle, XCircle, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Quotation, QuotationStatus } from "@/hooks/useQuotations";
import { toast } from "sonner";

interface QuotationProcessingTabProps {
  quotations: Quotation[];
  loading: boolean;
  respondToQuotation: (
    quotationId: string,
    response: { price: number; message: string; validDays?: number }
  ) => Promise<boolean>;
  updateQuotationStatus: (quotationId: string, status: QuotationStatus) => Promise<boolean>;
}

const QUOTATION_FILTERS = [
  { value: "all", label: "All Quotations" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "quoted", label: "Quoted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const getQuotationStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    pending: "outline",
    reviewed: "secondary",
    quoted: "default",
    accepted: "default",
    rejected: "destructive",
    expired: "secondary",
  };
  return variants[status] || "outline";
};

export default function QuotationProcessingTab({
  quotations,
  loading,
  respondToQuotation,
  updateQuotationStatus,
}: QuotationProcessingTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [responseOpen, setResponseOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [quotationPrice, setQuotationPrice] = useState("");
  const [quotationMessage, setQuotationMessage] = useState("");
  const [validDays, setValidDays] = useState("7");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailQuotation, setDetailQuotation] = useState<Quotation | null>(null);

  const filteredQuotations = statusFilter === "all"
    ? quotations
    : quotations.filter((q) => q.status === statusFilter);

  const statusCounts = quotations.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleRespondToQuotation = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setQuotationPrice("");
    setQuotationMessage("");
    setValidDays("7");
    setResponseOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedQuotationId || !quotationPrice) return;
    const price = parseFloat(quotationPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const success = await respondToQuotation(selectedQuotationId, {
      price,
      message: quotationMessage,
      validDays: parseInt(validDays) || 7,
    });
    if (success) {
      setResponseOpen(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3 animate-pulse" />
        <p className="text-muted-foreground">Loading quotations...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Quotation Requests</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUOTATION_FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label} {f.value !== "all" && statusCounts[f.value] ? `(${statusCounts[f.value]})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {["pending", "reviewed", "quoted", "accepted", "rejected", "expired"].map((s) => (
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

      {filteredQuotations.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {statusFilter === "all" ? "No quotation requests yet." : `No ${statusFilter} quotations.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuotations.map((quotation) => (
            <Card key={quotation.id} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">Quotation #{quotation.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(quotation.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant={getQuotationStatusBadge(quotation.status)}>
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </Badge>
                </div>

                {/* Customer Message */}
                {quotation.message && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Customer Message:</p>
                    <p className="text-sm text-foreground">{quotation.message}</p>
                  </div>
                )}

                {/* Quotation Items */}
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-foreground mb-2">Requested Items:</p>
                  <div className="space-y-2">
                    {quotation.quotation_items?.map((item) => (
                      <div key={item.id} className="text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-foreground">
                            {item.product_name} × {item.quantity}
                          </span>
                        </div>
                        {item.specifications && (
                          <p className="text-muted-foreground text-xs">Specs: {item.specifications}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response (if quoted) */}
                {quotation.status === "quoted" && quotation.quoted_price && (
                  <div className="border-t pt-3 bg-accent/10 -mx-4 px-4 py-3 -mb-4 rounded-b-lg">
                    <p className="text-sm font-medium text-foreground">Your Quote:</p>
                    <p className="text-lg font-bold text-accent">{quotation.quoted_price.toLocaleString()} Tsh</p>
                    {quotation.merchant_response && (
                      <p className="text-sm text-muted-foreground mt-1">{quotation.merchant_response}</p>
                    )}
                    {quotation.valid_until && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Valid until: {new Date(quotation.valid_until).toLocaleDateString()}
                        {new Date(quotation.valid_until) < new Date() && (
                          <span className="text-destructive ml-1">(Expired)</span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Accepted quotation */}
                {quotation.status === "accepted" && quotation.quoted_price && (
                  <div className="border-t pt-3 bg-accent/10 -mx-4 px-4 py-3 -mb-4 rounded-b-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <p className="text-sm font-medium text-accent">Accepted by Customer</p>
                    </div>
                    <p className="text-lg font-bold text-accent mt-1">{quotation.quoted_price.toLocaleString()} Tsh</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  {quotation.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateQuotationStatus(quotation.id, "reviewed")}
                        variant="outline"
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleRespondToQuotation(quotation.id)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send Quote
                      </Button>
                    </>
                  )}
                  {quotation.status === "reviewed" && (
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => handleRespondToQuotation(quotation.id)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Quote
                    </Button>
                  )}
                  {(quotation.status === "quoted" && quotation.valid_until && new Date(quotation.valid_until) < new Date()) && (
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => handleRespondToQuotation(quotation.id)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Re-Quote
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDetailQuotation(quotation);
                      setDetailOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quotation Response Dialog */}
      <Dialog open={responseOpen} onOpenChange={setResponseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quoted Price (Tsh) *</Label>
              <Input
                type="number"
                placeholder="Enter total price"
                value={quotationPrice}
                onChange={(e) => setQuotationPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valid For (days)</Label>
              <Select value={validDays} onValueChange={setValidDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message to Customer</Label>
              <Textarea
                placeholder="Add notes about pricing, availability, delivery timeline..."
                value={quotationMessage}
                onChange={(e) => setQuotationMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseOpen(false)}>Cancel</Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleConfirmResponse}
              disabled={!quotationPrice}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quotation #{detailQuotation?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {detailQuotation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={getQuotationStatusBadge(detailQuotation.status)}>
                    {detailQuotation.status.charAt(0).toUpperCase() + detailQuotation.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(detailQuotation.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              {detailQuotation.message && (
                <div>
                  <p className="font-medium mb-1">Customer Message</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{detailQuotation.message}</p>
                </div>
              )}

              <div>
                <p className="font-medium mb-2">Requested Items</p>
                {detailQuotation.quotation_items?.map((item) => (
                  <div key={item.id} className="py-2 border-b last:border-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.product_name}</span>
                      <span>× {item.quantity}</span>
                    </div>
                    {item.specifications && (
                      <p className="text-xs text-muted-foreground mt-1">Specs: {item.specifications}</p>
                    )}
                  </div>
                ))}
              </div>

              {detailQuotation.quoted_price && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-1">Your Response</p>
                    <p className="text-lg font-bold text-accent">{detailQuotation.quoted_price.toLocaleString()} Tsh</p>
                    {detailQuotation.merchant_response && (
                      <p className="text-sm text-muted-foreground mt-1">{detailQuotation.merchant_response}</p>
                    )}
                    {detailQuotation.valid_until && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Valid until: {new Date(detailQuotation.valid_until).toLocaleDateString()}
                      </p>
                    )}
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
