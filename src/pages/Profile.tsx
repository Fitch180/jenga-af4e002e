import { useState } from "react";
import { Settings, MapPin, Phone, Mail, Edit, Pin, Store, Shield, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { MERCHANTS, PRODUCTS } from "@/data/mockData";
import { MerchantCard } from "@/components/MerchantCard";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notes, setNotes] = useState(
    "Remember to check tile samples before final order.\nBudget: 5M Tsh for renovation.\nContractor needed by end of month."
  );
  const [pinnedMerchants] = useState<number[]>([1, 4]);
  const [pinnedProducts] = useState<string[]>(["1", "19"]);

  const handleSaveNotes = () => {
    toast({
      title: "Notes saved",
      description: "Your notes have been updated successfully",
    });
  };

  const toggleMerchantPin = (id: number) => {
    toast({
      title: "Pin updated",
      description: "Merchant pin status changed",
    });
  };

  const toggleProductPin = (id: string) => {
    toast({
      title: "Pin updated",
      description: "Product pin status changed",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon">
            <Settings className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">John Doe</h2>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>john.doe@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+255 754 123 456</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Dar es Salaam, Tanzania</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Access Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => navigate("/orders")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5" />
                <span className="font-semibold">My Orders</span>
              </div>
              <span className="text-xs opacity-90">View order history and tracking</span>
            </Button>

            <Button
              onClick={() => navigate("/merchant-dashboard")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-start border-accent text-accent hover:bg-accent/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-5 h-5" />
                <span className="font-semibold">Merchant Dashboard</span>
              </div>
              <span className="text-xs opacity-75">Manage your products and orders</span>
            </Button>
            
            <Button
              onClick={() => navigate("/admin-dashboard")}
              variant="outline"
              className="h-auto py-4 flex flex-col items-start border-accent text-accent hover:bg-accent/10 md:col-span-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Admin Dashboard</span>
              </div>
              <span className="text-xs opacity-75">Manage platform and merchants</span>
            </Button>
          </div>
        </Card>

        {/* Tabs for Pinned Items and Notes */}
        <Tabs defaultValue="pinned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pinned">Pinned Items</TabsTrigger>
            <TabsTrigger value="notes">My Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="pinned" className="space-y-6 mt-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Pinned Merchants</h3>
              </div>
              <div className="space-y-3">
                {MERCHANTS.filter((m) => pinnedMerchants.includes(m.id)).map((merchant) => (
                  <MerchantCard
                    key={merchant.id}
                    {...merchant}
                    isPinned={true}
                    onPin={() => toggleMerchantPin(merchant.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Pinned Products</h3>
              </div>
              <div className="space-y-3">
                {PRODUCTS.filter((p) => pinnedProducts.includes(p.id)).map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    isPinned={true}
                    onPin={() => toggleProductPin(product.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Notes</h3>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes here..."
                className="min-h-[300px] mb-4"
              />
              <Button onClick={handleSaveNotes} className="bg-accent hover:bg-accent/90">
                Save Notes
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* About Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">About Jenga</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jenga is Tanzania's leading marketplace for the housing industry, connecting
            architects, engineers, contractors, painters, repair professionals, gardeners,
            and suppliers of furniture, lighting, and décor. Find trusted merchants, browse
            quality products, and communicate directly for quotations and orders.
          </p>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
