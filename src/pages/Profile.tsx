import { User, Mail, Settings, Store, Clock, FileText, LogOut, Pin, NotebookPen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { usePinned } from "@/contexts/PinnedContext";
import { useOrders } from "@/contexts/OrderContext";
import { useQuotations } from "@/contexts/QuotationContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { pinnedMerchants, pinnedProducts } = usePinned();
  const { orders } = useOrders();
  const { getUserQuotations } = useQuotations();
  const totalPinned = pinnedMerchants.length + pinnedProducts.length;
  const ordersCount = orders.length;
  const quotationsCount = getUserQuotations().length;
  
  const [journalCount, setJournalCount] = useState(0);
  
  useEffect(() => {
    const savedEntries = localStorage.getItem("journalEntries");
    if (savedEntries) {
      setJournalCount(JSON.parse(savedEntries).length);
    }
  }, []);

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

        {/* Quick Access Section - Dashboards */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/merchant-dashboard">
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-auto py-4 flex flex-col items-center"
              >
                <Store className="w-6 h-6 mb-2" />
                <span className="font-semibold text-sm">Merchant Dashboard</span>
              </Button>
            </Link>
            
            <Link to="/admin-dashboard">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center border-accent text-accent hover:bg-accent/10"
              >
                <Settings className="w-6 h-6 mb-2" />
                <span className="font-semibold text-sm">Admin Dashboard</span>
              </Button>
            </Link>
          </div>
        </Card>

        {/* My Items Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">My Items</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/orders">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center border-border hover:bg-muted relative"
              >
                <Clock className="w-6 h-6 mb-2 text-primary" />
                <span className="font-semibold text-sm">My Orders</span>
                {ordersCount > 0 && (
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {ordersCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/quotations">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center border-border hover:bg-muted relative"
              >
                <FileText className="w-6 h-6 mb-2 text-primary" />
                <span className="font-semibold text-sm">My Quotations</span>
                {quotationsCount > 0 && (
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {quotationsCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/journal">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center border-border hover:bg-muted relative"
              >
                <NotebookPen className="w-6 h-6 mb-2 text-primary" />
                <span className="font-semibold text-sm">My Journal</span>
                {journalCount > 0 && (
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {journalCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/pinned">
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center border-border hover:bg-muted relative"
              >
                <Pin className="w-6 h-6 mb-2 text-primary" />
                <span className="font-semibold text-sm">Pinned Items</span>
                {totalPinned > 0 && (
                  <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {totalPinned}
                  </span>
                )}
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
