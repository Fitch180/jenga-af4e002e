import { User, Mail, MapPin, Heart, Clock, FileText, LogOut, BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { usePinned } from "@/contexts/PinnedContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { pinnedMerchants, pinnedProducts } = usePinned();
  const totalPinned = pinnedMerchants.length + pinnedProducts.length;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{user.email}</h2>
              <div className="flex items-center gap-3 text-muted-foreground mt-2">
                <Mail className="w-5 h-5" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Access Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link to="/orders">
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-auto py-4 flex flex-col items-start"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">My Orders</span>
                </div>
                <span className="text-xs opacity-90">View order history and tracking</span>
              </Button>
            </Link>

            <Link to="/quotations">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-start border-accent text-accent hover:bg-accent/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">My Quotations</span>
                </div>
                <span className="text-xs opacity-75">View and manage quote requests</span>
              </Button>
            </Link>

            <Link to="/journal">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-start border-accent text-accent hover:bg-accent/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookMarked className="w-5 h-5" />
                  <span className="font-semibold">My Journal</span>
                  {totalPinned > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {totalPinned}
                    </span>
                  )}
                </div>
                <span className="text-xs opacity-75">Pinned merchants and products</span>
              </Button>
            </Link>

            <Link to="/merchant-dashboard">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-start border-accent text-accent hover:bg-accent/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">Merchant Dashboard</span>
                </div>
                <span className="text-xs opacity-75">Manage your products and orders</span>
              </Button>
            </Link>
            
            <Link to="/admin-dashboard">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-start border-accent text-accent hover:bg-accent/10"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Admin Dashboard</span>
                </div>
                <span className="text-xs opacity-75">Manage platform and merchants</span>
              </Button>
            </Link>
          </div>
        </Card>

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

      <BottomNav activeTab="profile" onTabChange={(tab) => navigate(`/${tab === "merchants" ? "" : tab}`)} />
    </div>
  );
};

export default Profile;
