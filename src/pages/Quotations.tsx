import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuotations, QuotationStatus } from "@/hooks/useQuotations";
import { useState } from "react";

const Quotations = () => {
  const navigate = useNavigate();
  const { quotations, loading, updateQuotationStatus } = useQuotations();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "quoted" | "completed">("all");

  const filteredQuotations = quotations.filter(q => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return q.status === "pending" || q.status === "reviewed";
    if (activeTab === "quoted") return q.status === "quoted";
    if (activeTab === "completed") return q.status === "accepted" || q.status === "rejected" || q.status === "expired";
    return true;
  });

  const handleAccept = async (id: string) => {
    await updateQuotationStatus(id, "accepted");
  };

  const handleReject = async (id: string) => {
    await updateQuotationStatus(id, "rejected");
  };

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case "pending":
      case "reviewed":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "quoted":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "accepted":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "rejected":
      case "expired":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
    }
  };

  if (loading) {
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
            <h1 className="text-xl font-bold">My Quotations</h1>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <FileText className="w-24 h-24 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading quotations...</p>
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
          <h1 className="text-xl font-bold">My Quotations</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {quotations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No quotations yet</h2>
            <p className="text-muted-foreground mb-6">
              Request quotations from merchants and they'll appear here
            </p>
            <Button onClick={() => navigate("/")}>Browse Merchants</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All ({quotations.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="quoted" className="flex-1">
                  Quoted
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">
                  Completed
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4 space-y-4">
                {filteredQuotations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No quotations in this category
                  </div>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <Card key={quotation.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">
                            {quotation.merchant_profiles?.business_name || "Merchant"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quotation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(quotation.status)}>
                          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Items */}
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                        {quotation.quotation_items?.map((item) => (
                          <div key={item.id} className="text-sm text-muted-foreground">
                            • {item.product_name} x {item.quantity}
                            {item.specifications && ` (${item.specifications})`}
                          </div>
                        ))}
                      </div>

                      {quotation.message && (
                        <p className="text-sm text-muted-foreground italic">
                          "{quotation.message}"
                        </p>
                      )}

                      {/* Quote Response */}
                      {quotation.status === "quoted" && quotation.quoted_price && (
                        <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                          <p className="text-lg font-bold text-accent">
                            Quoted: {quotation.quoted_price.toLocaleString()} Tsh
                          </p>
                          {quotation.merchant_response && (
                            <p className="text-sm text-foreground">{quotation.merchant_response}</p>
                          )}
                          {quotation.valid_until && (
                            <p className="text-xs text-muted-foreground">
                              Valid until: {new Date(quotation.valid_until).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                              onClick={() => handleAccept(quotation.id)}
                            >
                              Accept Quote
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(quotation.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Quotations;
