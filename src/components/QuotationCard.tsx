import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, FileText, XCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Quotation, QuotationStatus } from "@/contexts/QuotationContext";
import { useNavigate } from "react-router-dom";

interface QuotationCardProps {
  quotation: Quotation;
  variant?: "user" | "merchant";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onRespond?: (id: string) => void;
}

const getStatusConfig = (status: QuotationStatus) => {
  switch (status) {
    case "pending":
      return { 
        icon: Clock, 
        label: "Pending Review", 
        color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" 
      };
    case "reviewed":
      return { 
        icon: FileText, 
        label: "Under Review", 
        color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" 
      };
    case "quoted":
      return { 
        icon: CheckCircle, 
        label: "Quote Received", 
        color: "bg-green-500/20 text-green-700 dark:text-green-400" 
      };
    case "accepted":
      return { 
        icon: CheckCircle, 
        label: "Accepted", 
        color: "bg-accent/20 text-accent" 
      };
    case "rejected":
      return { 
        icon: XCircle, 
        label: "Rejected", 
        color: "bg-destructive/20 text-destructive" 
      };
    case "expired":
      return { 
        icon: AlertCircle, 
        label: "Expired", 
        color: "bg-muted text-muted-foreground" 
      };
    default:
      return { 
        icon: Clock, 
        label: status, 
        color: "bg-muted text-muted-foreground" 
      };
  }
};

const QuotationCard = ({ quotation, variant = "user", onAccept, onReject, onRespond }: QuotationCardProps) => {
  const navigate = useNavigate();
  const statusConfig = getStatusConfig(quotation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Quotation ID</p>
            <p className="font-semibold text-foreground">{quotation.id}</p>
          </div>
          <Badge className={`${statusConfig.color} flex items-center gap-1`}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Merchant/User Info */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:text-accent transition-colors"
          onClick={() => variant === "user" && navigate(`/merchant/${quotation.merchantId}`)}
        >
          <span className="text-sm text-muted-foreground">
            {variant === "user" ? "From:" : "Customer:"}
          </span>
          <span className="font-medium text-foreground">
            {variant === "user" ? quotation.merchantName : `User ${quotation.userId}`}
          </span>
          {variant === "user" && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>

        {/* Items Summary */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm font-medium text-foreground mb-2">Items Requested:</p>
          <ul className="space-y-1">
            {quotation.items.slice(0, 3).map((item, index) => (
              <li key={index} className="text-sm text-muted-foreground flex justify-between">
                <span>{item.productName}</span>
                <span>x{item.quantity}</span>
              </li>
            ))}
            {quotation.items.length > 3 && (
              <li className="text-sm text-muted-foreground">
                + {quotation.items.length - 3} more item(s)
              </li>
            )}
          </ul>
        </div>

        {/* Message Preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          "{quotation.message}"
        </p>

        {/* Quoted Price (if available) */}
        {quotation.quotedPrice && (
          <div className="bg-accent/10 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Quoted Price:</span>
              <span className="text-lg font-bold text-accent">
                {quotation.quotedPrice.toLocaleString()} Tsh
              </span>
            </div>
            {quotation.validUntil && (
              <p className="text-xs text-muted-foreground mt-1">
                Valid until: {quotation.validUntil.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            )}
          </div>
        )}

        {/* Merchant Response */}
        {quotation.merchantResponse && (
          <div className="border-l-2 border-accent pl-3">
            <p className="text-sm text-muted-foreground italic">
              "{quotation.merchantResponse}"
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {quotation.createdAt.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </span>

          {/* Action Buttons */}
          {variant === "user" && quotation.status === "quoted" && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onReject?.(quotation.id)}
              >
                Reject
              </Button>
              <Button 
                size="sm" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => onAccept?.(quotation.id)}
              >
                Accept Quote
              </Button>
            </div>
          )}

          {variant === "merchant" && quotation.status === "pending" && (
            <Button 
              size="sm" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => onRespond?.(quotation.id)}
            >
              Respond
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuotationCard;
