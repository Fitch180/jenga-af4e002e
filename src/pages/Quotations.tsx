import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuotations, QuotationStatus } from "@/contexts/QuotationContext";
import QuotationCard from "@/components/QuotationCard";

const Quotations = () => {
  const navigate = useNavigate();
  const { getUserQuotations, updateQuotationStatus } = useQuotations();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "quoted" | "completed">("all");

  const quotations = getUserQuotations();

  const filteredQuotations = quotations.filter(q => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return q.status === "pending" || q.status === "reviewed";
    if (activeTab === "quoted") return q.status === "quoted";
    if (activeTab === "completed") return q.status === "accepted" || q.status === "rejected" || q.status === "expired";
    return true;
  });

  const handleAccept = (id: string) => {
    updateQuotationStatus(id, "accepted");
  };

  const handleReject = (id: string) => {
    updateQuotationStatus(id, "rejected");
  };

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
                    <QuotationCard
                      key={quotation.id}
                      quotation={quotation}
                      variant="user"
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
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
