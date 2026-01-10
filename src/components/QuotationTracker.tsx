import { FileText, MessageSquare, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { QuotationStatus } from "@/hooks/useQuotations";

interface QuotationTrackerProps {
  status: QuotationStatus;
  updatedAt?: Date;
  quotedPrice?: number | null;
  validUntil?: string | null;
}

const QUOTATION_STEPS = [
  { status: "pending", label: "Request Sent", icon: FileText },
  { status: "reviewed", label: "Reviewing", icon: MessageSquare },
  { status: "quoted", label: "Quote Received", icon: DollarSign },
  { status: "accepted", label: "Accepted", icon: CheckCircle },
];

const getStatusIndex = (status: QuotationStatus): number => {
  if (status === "rejected" || status === "expired") return -1;
  const index = QUOTATION_STEPS.findIndex(s => s.status === status);
  return index >= 0 ? index : 0;
};

const QuotationTracker = ({ status, updatedAt, quotedPrice, validUntil }: QuotationTrackerProps) => {
  const currentIndex = getStatusIndex(status);

  if (status === "rejected") {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
        <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive font-medium">Quotation Declined</p>
        {updatedAt && (
          <p className="text-sm text-muted-foreground mt-1">
            {updatedAt.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
        <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-yellow-700 dark:text-yellow-400 font-medium">Quotation Expired</p>
        {validUntil && (
          <p className="text-sm text-muted-foreground mt-1">
            Expired on {new Date(validUntil).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {QUOTATION_STEPS.map((step, index) => {
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
                        ? "bg-accent text-accent-foreground ring-4 ring-accent/20 animate-pulse"
                        : "bg-accent/80 text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < QUOTATION_STEPS.length - 1 && (
                  <div
                    className={`absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 transition-colors ${
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

      {/* Price Display for quoted status */}
      {status === "quoted" && quotedPrice && (
        <div className="bg-accent/10 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-accent">
            {quotedPrice.toLocaleString()} Tsh
          </p>
          {validUntil && (
            <p className="text-xs text-muted-foreground">
              Valid until {new Date(validUntil).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

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

export default QuotationTracker;
