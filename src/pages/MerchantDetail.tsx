import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MERCHANTS, PRODUCTS } from "@/data/mockData";
import { ProductCard } from "@/components/ProductCard";
import { useQuotations } from "@/contexts/QuotationContext";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";


const MerchantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addQuotation } = useQuotations();
  const { getOrCreateConversation } = useChat();
  const [quotationRequest, setQuotationRequest] = useState("");
  const [quotationItems, setQuotationItems] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const merchant = MERCHANTS.find(m => m.id === Number(id));
  const merchantProducts = PRODUCTS.filter(p => p.merchantId === Number(id));
  
  const getMerchantDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      TILES: "Premium tiles supplier offering high-quality ceramic, porcelain, and designer tiles for residential and commercial projects.",
      BUILDING: "Complete building materials and construction supplies. Quality products at competitive prices.",
      FURNITURE: "Contemporary furniture designs for modern homes and offices. Custom orders available.",
      LIGHTING: "Professional lighting solutions for residential and commercial spaces. Wide range of modern and classic designs.",
      PAINTING: "Professional painting supplies and services. High-quality paints and tools for all your painting needs.",
      PLUMBING: "Complete plumbing solutions and supplies. Quality fixtures and materials for all plumbing projects.",
      FLOORING: "Premium flooring solutions including hardwood, laminate, vinyl, and specialty flooring options.",
      ELECTRICAL: "Professional electrical supplies and solutions. Complete range of electrical materials and equipment.",
      GARDENING: "Complete garden supplies and landscaping services. Tools, plants, and outdoor solutions.",
      REPAIR: "Professional repair services and tools. Complete toolkit solutions for all maintenance needs.",
      DECOR: "Beautiful home decor and interior design elements. Transform your space with our curated collection.",
      CONTRACTORS: "Professional construction and contracting services. Reliable and quality workmanship.",
      ARCHITECTS: "Professional architectural design and planning services. Innovative designs for modern living.",
      ENGINEERS: "Structural and civil engineering services. Expert solutions for construction projects.",
    };
    return descriptions[category] || "Quality products and services for all your housing needs.";
  };

  if (!merchant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Merchant not found</h2>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleSendQuotation = () => {
    if (!quotationRequest.trim()) {
      return;
    }
    
    // Parse items from the items field
    const items = quotationItems.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split('-').map(p => p.trim());
      return {
        productName: parts[0] || line,
        quantity: parseInt(parts[1]) || 1,
        specifications: parts[2] || undefined
      };
    });

    addQuotation({
      merchantId: Number(id),
      merchantName: merchant.name,
      userId: "user-1",
      items: items.length > 0 ? items : [{ productName: "General inquiry", quantity: 1 }],
      message: quotationRequest
    });
    
    setQuotationRequest("");
    setQuotationItems("");
    setIsDialogOpen(false);
  };

  const openMap = () => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(merchant.location)}`, "_blank");
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!merchant) return;

    const conversationId = await getOrCreateConversation(
      merchant.id,
      merchant.name,
      merchant.image
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
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{merchant.name}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* LinkedIn-style Banner and Profile Photo */}
        <div className="relative">
          {/* Background Banner */}
          <div className="h-48 bg-gradient-to-r from-primary to-primary/70 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop" 
              alt="Company banner" 
              className="w-full h-full object-cover opacity-30"
            />
          </div>
          
          {/* Profile Photo */}
          <div className="absolute left-6 -bottom-16 w-32 h-32 rounded-lg overflow-hidden border-4 border-background bg-card shadow-xl">
            <img
              src={merchant.image}
              alt={merchant.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Merchant Info */}
        <div className="px-4 pt-20 pb-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{merchant.name}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {getMerchantDescription(merchant.category)}
            </p>
          </div>
              
          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <MapPin className="w-5 h-5 text-accent" />
                <span>{merchant.location}</span>
                <button
                  onClick={openMap}
                  className="text-accent hover:text-accent/80 text-sm font-medium ml-2"
                >
                  View on Map
                </button>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Phone className="w-5 h-5 text-accent" />
                <a href="tel:+255754123456" className="hover:text-accent transition-colors">
                  +255 754 123 456
                </a>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="w-5 h-5 text-accent" />
                <a href={`mailto:info@${merchant.name.toLowerCase().replace(/\s+/g, '')}.co.tz`} className="hover:text-accent transition-colors">
                  info@{merchant.name.toLowerCase().replace(/\s+/g, '')}.co.tz
                </a>
              </div>
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
                <DialogTitle>Request Quotation from {merchant.name}</DialogTitle>
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
                    disabled={!quotationRequest.trim()}
                  >
                    Send Request
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
            <div className="space-y-3">
              {merchantProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  isPinned={false}
                  onPin={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerchantDetail;
