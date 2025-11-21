import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const MERCHANTS = [
  {
    id: 1,
    name: "Dar Ceramica Center",
    location: "Mikocheni",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop",
    phone: "+255 123 456 789",
    email: "info@darceramica.com",
    description: "Premium ceramics and tiles supplier in Dar es Salaam. Offering high-quality materials for residential and commercial projects.",
    products: [
      { id: 1, name: "Ceramic Floor Tiles", price: "35,000 Tsh", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=400&fit=crop" },
      { id: 2, name: "Wall Tiles Premium", price: "28,000 Tsh", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop" },
      { id: 3, name: "Bathroom Tiles Set", price: "45,000 Tsh", image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=400&h=400&fit=crop" },
    ]
  },
  {
    id: 2,
    name: "ABC Emporio Tiles Tanzania",
    location: "Industrial Way Rd",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop",
    phone: "+255 234 567 890",
    email: "contact@abcemporio.co.tz",
    description: "Leading tiles distributor with a wide selection of local and imported tiles for all your construction needs.",
    products: [
      { id: 4, name: "Tiles Silex Dune 1.42", price: "25,000 Tsh", image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&h=400&fit=crop" },
      { id: 5, name: "Porcelain Tiles", price: "38,000 Tsh", image: "https://images.unsplash.com/photo-1600607688960-e095ff83135c?w=400&h=400&fit=crop" },
    ]
  },
  {
    id: 3,
    name: "Elite Hardware Supplies",
    location: "Msasani",
    image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&h=400&fit=crop",
    phone: "+255 345 678 901",
    email: "sales@elitehardware.com",
    description: "Complete hardware solutions for construction and renovation projects. Quality products at competitive prices.",
    products: [
      { id: 6, name: "Premium Wall Paint", price: "45,000 Tsh", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop" },
      { id: 7, name: "Power Tools Set", price: "125,000 Tsh", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop" },
    ]
  },
  {
    id: 4,
    name: "Modern Living Furniture",
    location: "Masaki",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop",
    phone: "+255 456 789 012",
    email: "info@modernliving.co.tz",
    description: "Contemporary furniture designs for modern homes and offices. Custom orders available.",
    products: [
      { id: 8, name: "Modern Sofa Set", price: "1,500,000 Tsh", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop" },
      { id: 9, name: "Dining Table Set", price: "850,000 Tsh", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop" },
    ]
  },
];

const MerchantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotationRequest, setQuotationRequest] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const merchant = MERCHANTS.find(m => m.id === Number(id));

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
      toast.error("Please enter your quotation request");
      return;
    }
    toast.success("Quotation request sent successfully!");
    setQuotationRequest("");
    setIsDialogOpen(false);
  };

  const openMap = () => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(merchant.location)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{merchant.name}</h1>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Merchant Info Card */}
        <Card className="overflow-hidden">
          <div className="bg-primary/5 p-6 flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              <img
                src={merchant.image}
                alt={merchant.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{merchant.name}</h2>
                <p className="text-muted-foreground">{merchant.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-foreground">{merchant.location}</span>
                  <button
                    onClick={openMap}
                    className="text-accent hover:text-accent/80 text-sm font-medium ml-2"
                  >
                    View on Map
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-accent" />
                  <a href={`tel:${merchant.phone}`} className="text-foreground hover:text-accent">
                    {merchant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-accent" />
                  <a href={`mailto:${merchant.email}`} className="text-foreground hover:text-accent">
                    {merchant.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Quotation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Quotation from {merchant.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Textarea
                        placeholder="Describe what you need... (materials, quantities, specifications, etc.)"
                        value={quotationRequest}
                        onChange={(e) => setQuotationRequest(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSendQuotation}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          Send Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={() => navigate("/")}>
                  Contact Merchant
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Products Catalog */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Products from {merchant.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchant.products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center p-4 gap-4">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{product.name}</h4>
                    <p className="text-lg font-bold text-accent">{product.price}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerchantDetail;
