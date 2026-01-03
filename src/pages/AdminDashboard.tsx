import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Store, Package, TrendingUp, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MERCHANTS, PRODUCTS } from "@/data/mockData";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats] = useState({
    totalMerchants: MERCHANTS.length,
    totalProducts: PRODUCTS.length,
    totalUsers: 156,
    totalRevenue: "45,680,000",
    pendingApprovals: 3,
  });

  const [pendingMerchants] = useState([
    { id: 1, name: "New Tiles Supplier", category: "TILES", status: "pending" },
    { id: 2, name: "Premium Furniture Co.", category: "FURNITURE", status: "pending" },
    { id: 3, name: "Smart Electric Solutions", category: "ELECTRICAL", status: "pending" },
  ]);

  const [recentUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", joined: "2025-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", joined: "2025-01-14" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", joined: "2025-01-13" },
  ]);

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Merchants</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMerchants}</p>
              </div>
              <Store className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRevenue} Tsh</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 border-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-accent">{stats.pendingApprovals}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.pendingApprovals}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="merchants" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="merchants" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">Pending Approvals</h2>
                <div className="space-y-3">
                  {pendingMerchants.map((merchant) => (
                    <Card key={merchant.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-foreground">{merchant.name}</p>
                          <p className="text-sm text-muted-foreground">{merchant.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-accent hover:bg-accent/90">
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive">
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">All Merchants ({MERCHANTS.length})</h2>
                <div className="space-y-3">
                  {MERCHANTS.slice(0, 5).map((merchant) => (
                    <Card key={merchant.id} className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={merchant.image}
                          alt={merchant.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-foreground">{merchant.name}</p>
                              <p className="text-sm text-muted-foreground">{merchant.category}</p>
                              <p className="text-sm text-muted-foreground">{merchant.location}</p>
                            </div>
                            <Badge variant="default">Active</Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">Recent Users</h2>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Joined: {user.joined}</p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">All Products ({PRODUCTS.length})</h2>
              <Button variant="outline">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRODUCTS.slice(0, 6).map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.merchant}</p>
                      <p className="font-bold text-accent text-sm mt-1">{product.price}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Platform Growth</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">New Merchants (30d)</span>
                    <span className="font-bold text-accent">+12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">New Users (30d)</span>
                    <span className="font-bold text-accent">+89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">New Products (30d)</span>
                    <span className="font-bold text-accent">+156</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Revenue Analytics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="font-bold text-foreground">18,500,000 Tsh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Month</span>
                    <span className="font-bold text-foreground">14,200,000 Tsh</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Growth</span>
                    <span className="font-bold text-accent">+30.3%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
