import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Store, Package, TrendingUp, Shield, Settings, Check, X, Eye, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MERCHANTS, PRODUCTS } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MerchantProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_registration_number: string | null;
  country_registered: string;
  revenue_authority_number: string | null;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "merchant" | "user";
}

interface UserWithRole extends Profile {
  roles: UserRole[];
}

interface MerchantWithProfile extends MerchantProfile {
  profile?: Profile;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pendingMerchants, setPendingMerchants] = useState<MerchantWithProfile[]>([]);
  const [allMerchants, setAllMerchants] = useState<MerchantWithProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantWithProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const [stats, setStats] = useState({
    totalMerchants: MERCHANTS.length,
    totalProducts: PRODUCTS.length,
    totalUsers: 0,
    totalRevenue: "45,680,000",
    pendingApprovals: 0,
  });

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => ({
        ...profile,
        roles: (roles || []).filter((role) => role.user_id === profile.user_id),
      }));

      setAllUsers(usersWithRoles);
      setStats((prev) => ({
        ...prev,
        totalUsers: usersWithRoles.length,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users data.",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      // Fetch all merchant profiles
      const { data: merchants, error } = await supabase
        .from("merchant_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each merchant
      const merchantsWithProfiles: MerchantWithProfile[] = [];
      for (const merchant of merchants || []) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", merchant.user_id)
          .maybeSingle();

        merchantsWithProfiles.push({
          ...merchant,
          profile: profile || undefined,
        });
      }

      const pending = merchantsWithProfiles.filter(m => m.approval_status === "pending");
      setPendingMerchants(pending);
      setAllMerchants(merchantsWithProfiles);
      setStats(prev => ({
        ...prev,
        pendingApprovals: pending.length,
        totalMerchants: merchantsWithProfiles.length,
      }));
    } catch (error) {
      console.error("Error fetching merchants:", error);
      toast({
        title: "Error",
        description: "Failed to fetch merchant data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
    fetchUsers();
  }, []);

  const handleApprove = async (merchantId: string) => {
    try {
      const { error } = await supabase
        .from("merchant_profiles")
        .update({ approval_status: "approved" })
        .eq("id", merchantId);

      if (error) throw error;

      toast({
        title: "Merchant Approved",
        description: "The merchant account has been approved successfully.",
      });

      fetchMerchants();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error approving merchant:", error);
      toast({
        title: "Error",
        description: "Failed to approve merchant.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (merchantId: string) => {
    try {
      const { error } = await supabase
        .from("merchant_profiles")
        .update({ approval_status: "rejected" })
        .eq("id", merchantId);

      if (error) throw error;

      toast({
        title: "Merchant Rejected",
        description: "The merchant application has been rejected.",
      });

      fetchMerchants();
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting merchant:", error);
      toast({
        title: "Error",
        description: "Failed to reject merchant.",
        variant: "destructive",
      });
    }
  };

  const handleAddRole = async (userId: string, role: "admin" | "merchant" | "user") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Role Exists",
            description: "This user already has this role.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Role Added",
        description: `Successfully added ${role} role.`,
      });

      fetchUsers();
      setIsUserDialogOpen(false);
    } catch (error) {
      console.error("Error adding role:", error);
      toast({
        title: "Error",
        description: "Failed to add role.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Role Removed",
        description: "Successfully removed role.",
      });

      fetchUsers();
      setIsUserDialogOpen(false);
    } catch (error) {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: "Failed to remove role.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const viewMerchantDetails = (merchant: MerchantWithProfile) => {
    setSelectedMerchant(merchant);
    setIsViewDialogOpen(true);
  };

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
                <p className="text-2xl font-bold text-foreground">{allMerchants.length || stats.totalMerchants}</p>
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
                <h2 className="text-xl font-bold text-foreground mb-3">
                  Pending Approvals ({pendingMerchants.length})
                </h2>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : pendingMerchants.length === 0 ? (
                  <Card className="p-4">
                    <p className="text-muted-foreground text-center">No pending applications</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {pendingMerchants.map((merchant) => (
                      <Card key={merchant.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-foreground">{merchant.business_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {merchant.profile?.first_name} {merchant.profile?.last_name} • {merchant.country_registered}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Applied: {new Date(merchant.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewMerchantDetails(merchant)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(merchant.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(merchant.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">All Merchants ({allMerchants.length})</h2>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  <div className="space-y-3">
                    {allMerchants.map((merchant) => (
                      <Card key={merchant.id} className="p-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Store className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-foreground">{merchant.business_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {merchant.profile?.first_name} {merchant.profile?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{merchant.country_registered}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(merchant.approval_status)}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => viewMerchantDetails(merchant)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">All Users ({allUsers.length})</h2>
            </div>
            {usersLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : allUsers.length === 0 ? (
              <Card className="p-4">
                <p className="text-muted-foreground text-center">No users found</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {allUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground">
                          {user.first_name} {user.last_name || ""}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline">User</Badge>
                          ) : (
                            user.roles.map((role) => (
                              <Badge
                                key={role.id}
                                variant={role.role === "admin" ? "default" : role.role === "merchant" ? "secondary" : "outline"}
                              >
                                {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserDialogOpen(true);
                          }}
                        >
                          <UserCog className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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

      {/* Merchant Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Merchant Details</DialogTitle>
            <DialogDescription>
              Review merchant application details
            </DialogDescription>
          </DialogHeader>
          {selectedMerchant && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedMerchant.approval_status)}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Owner Name</span>
                  <p className="font-medium">
                    {selectedMerchant.profile?.first_name} {selectedMerchant.profile?.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Business Name</span>
                  <p className="font-medium">{selectedMerchant.business_name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Country Registered</span>
                  <p className="font-medium">{selectedMerchant.country_registered}</p>
                </div>
                {selectedMerchant.business_registration_number && (
                  <div>
                    <span className="text-sm text-muted-foreground">Business Reg. Number</span>
                    <p className="font-medium">{selectedMerchant.business_registration_number}</p>
                  </div>
                )}
                {selectedMerchant.revenue_authority_number && (
                  <div>
                    <span className="text-sm text-muted-foreground">Revenue Authority Number</span>
                    <p className="font-medium">{selectedMerchant.revenue_authority_number}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Applied On</span>
                  <p className="font-medium">
                    {new Date(selectedMerchant.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedMerchant.approval_status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleApprove(selectedMerchant.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedMerchant.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              View and manage user roles
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Name</span>
                  <p className="font-medium">
                    {selectedUser.first_name} {selectedUser.last_name || ""}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <p className="font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Current Roles</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUser.roles.length === 0 ? (
                      <Badge variant="outline">No special roles</Badge>
                    ) : (
                      selectedUser.roles.map((role) => (
                        <div key={role.id} className="flex items-center gap-1">
                          <Badge
                            variant={role.role === "admin" ? "default" : role.role === "merchant" ? "secondary" : "outline"}
                          >
                            {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveRole(role.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Add Role</p>
                <div className="flex gap-2">
                  <Select onValueChange={(value) => handleAddRole(selectedUser.user_id, value as "admin" | "merchant" | "user")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role to add" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="merchant">Merchant</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
