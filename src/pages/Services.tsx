import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Wrench, HardHat, Paintbrush, Droplets, Building2, Trees, FileText, Loader2, Zap, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICE_CATEGORIES } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  ARCHITECTS: <Building2 className="w-6 h-6" />,
  ENGINEERS: <HardHat className="w-6 h-6" />,
  CONTRACTORS: <Wrench className="w-6 h-6" />,
  PLUMBING: <Droplets className="w-6 h-6" />,
  ELECTRICAL: <Zap className="w-6 h-6" />,
  PAINTING: <Paintbrush className="w-6 h-6" />,
  GARDENING: <Trees className="w-6 h-6" />,
  REPAIR: <Hammer className="w-6 h-6" />,
};

interface ServiceProduct {
  id: string;
  name: string;
  price: number | null;
  category: string;
  image_url: string | null;
  item_type: string;
  merchant_profiles?: {
    id: string;
    business_name: string;
    profile_image_url: string | null;
  };
}

interface ServiceMerchant {
  id: string;
  business_name: string;
  profile_image_url: string | null;
  category: string | null;
}

const Services = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [serviceMerchants, setServiceMerchants] = useState<ServiceMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch service products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            id, name, price, category, image_url, item_type,
            merchant_profiles (id, business_name, profile_image_url)
          `)
          .eq("item_type", "service")
          .eq("is_active", true);

        if (productsError) throw productsError;
        setServices(productsData || []);

        // Fetch merchants in service categories
        const { data: merchantsData, error: merchantsError } = await supabase
          .from("merchant_profiles")
          .select("id, business_name, profile_image_url, category")
          .eq("approval_status", "approved")
          .in("category", SERVICE_CATEGORIES);

        if (merchantsError) throw merchantsError;
        setServiceMerchants(merchantsData || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.merchant_profiles?.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRequestQuotation = (service: ServiceProduct) => {
    toast.success("Quotation request sent!", {
      description: `Your request for ${service.name} has been sent to ${service.merchant_profiles?.business_name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Professional Services</h1>
              <p className="text-primary-foreground/80 text-sm">
                Find engineers, architects, contractors & more
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? "bg-accent hover:bg-accent/90" : ""}
          >
            All
          </Button>
          {SERVICE_CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-accent hover:bg-accent/90" : ""}
            >
              <span className="mr-1">{SERVICE_ICONS[category]}</span>
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Service Professionals */}
          {serviceMerchants.length > 0 && (
            <section className="max-w-4xl mx-auto px-4 mb-6">
              <h2 className="text-lg font-bold text-foreground mb-3">Service Professionals</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {serviceMerchants.map((merchant) => (
                  <Card
                    key={merchant.id}
                    className="cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => navigate(`/merchant/${merchant.id}`)}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden ring-2 ring-accent/20 group-hover:ring-accent transition-all">
                        {merchant.profile_image_url ? (
                          <img
                            src={merchant.profile_image_url}
                            alt={merchant.business_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <span className="text-xl font-bold">{merchant.business_name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground truncate">{merchant.business_name}</h3>
                      {merchant.category && (
                        <Badge variant="secondary" className="text-xs mt-1 bg-accent/10 text-accent">
                          {merchant.category}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Services List */}
          <section className="max-w-4xl mx-auto px-4">
            <h2 className="text-lg font-bold text-foreground mb-3">Available Services</h2>
            
            {filteredServices.length === 0 ? (
              <Card className="p-8 text-center">
                <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No services found matching your criteria</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden hover:shadow-md transition-all">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex items-center gap-4 flex-1 p-4 cursor-pointer"
                          onClick={() => navigate(`/product/${service.id}`)}
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-2 ring-accent/20">
                            {service.image_url ? (
                              <img
                                src={service.image_url}
                                alt={service.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {SERVICE_ICONS[service.category] || <Wrench className="w-8 h-8" />}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {service.name}
                              </h3>
                              <Badge className="bg-accent/10 text-accent text-xs">
                                Service
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {service.merchant_profiles?.business_name}
                            </p>
                            <p className="text-lg font-bold text-accent mt-1">
                              {service.price ? `${service.price.toLocaleString()} Tsh` : "Request Quote"}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="mr-4 bg-accent hover:bg-accent/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestQuotation(service);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Request Quote
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Services;