import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, MessageSquare, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductCard } from "@/components/ProductCard";
import { useQuotations } from "@/hooks/useQuotations";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MerchantProfile {
  id: string;
  user_id: string;
  business_name: string;
  country_registered: string;
  approval_status: string;
  profile_image_url: string | null;
  background_image_url: string | null;
  phone_number: string | null;
  email: string | null;
  description: string | null;
  operating_hours: unknown;
  category: string | null;
}

interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string;
  image_url: string | null;
  item_type: string;
}

const MerchantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createQuotation } = useQuotations();
  const { getOrCreateConversation } = useChat();
  const [quotationRequest, setQuotationRequest] = useState("");
  const [quotationItems, setQuotationItems] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch merchant profile
        const { data: merchantData, error: merchantError } = await supabase
          .from("merchant_profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (merchantError) throw merchantError;

        setMerchant(merchantData);

        // Fetch merchant's products
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("merchant_id", id)
          .eq("is_active", true);

        if (productError) throw productError;
        setProducts(productData || []);
      } catch (error) {
        console.error("Error fetching merchant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantData();
  }, [id]);
  
  const getOperatingHoursDisplay = (hours: unknown): string => {
    if (!hours || typeof hours !== 'object') return "Contact for hours";
    const hoursObj = hours as Record<string, string>;
    if (hoursObj.display) return hoursObj.display;
    return "Contact for hours";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Merchant not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleSendQuotation = async () => {
    if (!quotationRequest.trim()) {
      toast.error("Please describe your requirements");
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse items from the items field
      const items = quotationItems.split('\n').filter(line => line.trim()).map(line => {
        const parts = line.split('-').map(p => p.trim());
        return {
          product_name: parts[0] || line,
          quantity: parseInt(parts[1]) || 1,
          specifications: parts[2] || undefined
        };
      });

      const success = await createQuotation({
        merchant_id: id!,
        message: quotationRequest,
        items: items.length > 0 ? items : [{ product_name: "General inquiry", quantity: 1 }],
      });

      if (success) {
        setQuotationRequest("");
        setQuotationItems("");
        setIsDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMap = () => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(merchant.country_registered)}`, "_blank");
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const conversationId = await getOrCreateConversation(
      parseInt(id || "0"),
      merchant.business_name,
      ""
    );

    if (conversationId) {
      navigate(`/chat?conversation=${conversationId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{merchant.business_name}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* LinkedIn-style Banner and Profile Photo */}
        <div className="relative">
          {/* Background Banner */}
          <div className="h-48 bg-gradient-to-r from-primary to-primary/70 overflow-hidden">
            {merchant.background_image_url ? (
              <img 
                src={merchant.background_image_url} 
                alt="Company banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop" 
                alt="Company banner" 
                className="w-full h-full object-cover opacity-30"
              />
            )}
          </div>
          
          {/* Profile Photo */}
          <div className="absolute left-6 -bottom-16 w-32 h-32 rounded-lg overflow-hidden border-4 border-background bg-card shadow-xl flex items-center justify-center">
            {merchant.profile_image_url ? (
              <img 
                src={merchant.profile_image_url} 
                alt={merchant.business_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-muted-foreground">
                {merchant.business_name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Merchant Info */}
        <div className="px-4 pt-20 pb-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-foreground">{merchant.business_name}</h2>
              {merchant.category && (
                <Badge className="bg-accent text-accent-foreground text-sm px-3 py-1">
                  {merchant.category}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {merchant.description || "Quality products and services for all your needs."}
            </p>
          </div>
              
          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <MapPin className="w-5 h-5 text-accent" />
                <span>{merchant.country_registered}</span>
                <button
                  onClick={openMap}
                  className="text-accent hover:text-accent/80 text-sm font-medium ml-2"
                >
                  View on Map
                </button>
              </div>
              {merchant.phone_number && (
                <div className="flex items-center gap-3 text-foreground">
                  <Phone className="w-5 h-5 text-accent" />
                  <a href={`tel:${merchant.phone_number}`} className="hover:text-accent transition-colors">
                    {merchant.phone_number}
                  </a>
                </div>
              )}
              {merchant.email && (
                <div className="flex items-center gap-3 text-foreground">
                  <Mail className="w-5 h-5 text-accent" />
                  <a href={`mailto:${merchant.email}`} className="hover:text-accent transition-colors">
                    {merchant.email}
                  </a>
                </div>
              )}
              {merchant.operating_hours && (
                <div className="flex items-center gap-3 text-foreground">
                  <Clock className="w-5 h-5 text-accent" />
                  <span>{getOperatingHoursDisplay(merchant.operating_hours)}</span>
                </div>
              )}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleStartChat}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Request Quotation
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Quotation from {merchant.business_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="items">Items (one per line: Product - Quantity - Specs)</Label>
                  <Textarea
                    id="items"
                    placeholder="e.g., Ceramic Floor Tiles - 100 - 60x60cm White&#10;Wall Tiles Premium - 50 - 30x60cm Grey"
                    value={quotationItems}
                    onChange={(e) => setQuotationItems(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Details</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your project, timeline, delivery requirements, etc."
                    value={quotationRequest}
                    onChange={(e) => setQuotationRequest(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendQuotation}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={!quotationRequest.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>

          {/* Products Catalog */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Products & Services
            </h3>
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No products or services listed yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    merchant={merchant.business_name}
                    merchantId={product.merchant_id}
                    image={product.image_url || "/placeholder.svg"}
                    itemType={product.item_type as "product" | "service"}
                    isPinned={false}
                    onPin={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerchantDetail;
