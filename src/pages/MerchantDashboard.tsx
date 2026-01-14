import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, ShoppingCart, TrendingUp, Plus, Edit, Trash2, FileText, Upload, Send, MessageSquare, Settings, MapPin, Phone, Mail, Globe, Clock, Truck, CheckCircle, XCircle, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ProductFormDialog from "@/components/merchant/ProductFormDialog";
import DeleteConfirmDialog from "@/components/merchant/DeleteConfirmDialog";
import BulkUploadDialog from "@/components/merchant/BulkUploadDialog";
import { useMerchantChat } from "@/hooks/useMerchantChat";
import { useProducts, Product, ProductFormData } from "@/hooks/useProducts";
import { useUserRole } from "@/hooks/useUserRole";
import { useMerchantOrders, OrderStatus } from "@/hooks/useOrders";
import { useMerchantQuotations, QuotationStatus } from "@/hooks/useQuotations";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/data/mockData";

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const { merchantProfile, isApprovedMerchant, loading: roleLoading } = useUserRole();
  
  const merchantId = 1; // For chat - will be updated when we integrate fully
  const merchantUserId = merchantProfile?.user_id || "";

  // Products hook - uses real database
  const {
    products,
    loading: productsLoading,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts(merchantProfile?.id || null);

  // Orders hook - uses real database
  const {
    orders,
    loading: ordersLoading,
    updateOrderStatus,
    updateDeliveryFee,
  } = useMerchantOrders(merchantProfile?.id || null);

  // Quotations hook - uses real database
  const {
    quotations,
    loading: quotationsLoading,
    respondToQuotation,
    updateQuotationStatus,
  } = useMerchantQuotations(merchantProfile?.id || null);

  // Shop profile state
  const [shopProfile, setShopProfile] = useState({
    name: merchantProfile?.business_name || "Your Business",
    description: merchantProfile?.description || "",
    profileImage: merchantProfile?.profile_image_url || "",
    backgroundImage: merchantProfile?.background_image_url || "",
    location: merchantProfile?.country_registered || "",
    phone: merchantProfile?.phone_number || "",
    email: merchantProfile?.email || "",
    operatingHours: "",
    category: merchantProfile?.category || "",
  });

  // Update shop profile when merchant profile loads
  useEffect(() => {
    if (merchantProfile) {
      const opHours = merchantProfile.operating_hours as Record<string, string> | null;
      setShopProfile(prev => ({
        ...prev,
        name: merchantProfile.business_name,
        description: merchantProfile.description || "",
        profileImage: merchantProfile.profile_image_url || "",
        backgroundImage: merchantProfile.background_image_url || "",
        location: merchantProfile.country_registered || "",
        phone: merchantProfile.phone_number || "",
        email: merchantProfile.email || "",
        operatingHours: opHours?.display || "",
        category: merchantProfile.category || "",
      }));
      setEditedProfile(prev => ({
        ...prev,
        name: merchantProfile.business_name,
        description: merchantProfile.description || "",
        profileImage: merchantProfile.profile_image_url || "",
        backgroundImage: merchantProfile.background_image_url || "",
        location: merchantProfile.country_registered || "",
        phone: merchantProfile.phone_number || "",
        email: merchantProfile.email || "",
        operatingHours: opHours?.display || "",
        category: merchantProfile.category || "",
      }));
    }
  }, [merchantProfile]);

  const [editedProfile, setEditedProfile] = useState(shopProfile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const merchantName = shopProfile.name;
  
  const {
    conversations,
    messages,
    loading: chatLoading,
    loadMessages,
    sendMessage,
    markAsRead,
  } = useMerchantChat(merchantId);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Order processing states
  const [deliveryFeeDialogOpen, setDeliveryFeeDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState("");

  // Quotation response states
  const [quotationResponseOpen, setQuotationResponseOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [quotationPrice, setQuotationPrice] = useState("");
  const [quotationMessage, setQuotationMessage] = useState("");

  // Calculate stats from real data
  const stats = {
    totalOrders: orders.length,
    revenue: orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0),
    pendingOrders: orders.filter(o => o.status === "pending" || o.status === "confirmed").length,
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setDeletingProductId(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingProductId) {
      await deleteProduct(deletingProductId);
      setDeleteDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  const handleSaveProduct = async (productData: ProductFormData, productId?: string): Promise<boolean> => {
    setSaving(true);
    try {
      if (productId) {
        return await updateProduct(productId, productData);
      } else {
        return await addProduct(productData);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = async (uploadedProducts: any[]) => {
    if (!merchantProfile?.id) {
      toast.error("Merchant profile not found");
      return;
    }

    let successCount = 0;
    for (const p of uploadedProducts) {
      const success = await addProduct({
        name: p.name,
        price: parseFloat(p.price.replace(/[^0-9.]/g, "")) || 0,
        category: p.category,
        description: p.description || undefined,
        image_url: p.image || undefined,
        stock: 0,
        unit: "item",
        is_active: true,
      });
      if (success) successCount++;
    }
    
    if (successCount > 0) {
      toast.success(`${successCount} products uploaded successfully`);
    }
  };

  // Chat functions
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    await sendMessage(selectedConversation, newMessage, merchantUserId);
    setNewMessage("");
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  // Order processing functions
  const handleSetDeliveryFee = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDeliveryFeeInput("");
    setDeliveryFeeDialogOpen(true);
  };

  const handleConfirmDeliveryFee = async () => {
    if (!selectedOrderId || !deliveryFeeInput) return;
    const fee = parseFloat(deliveryFeeInput);
    if (isNaN(fee) || fee < 0) {
      toast.error("Please enter a valid delivery fee");
      return;
    }
    await updateDeliveryFee(selectedOrderId, fee);
    setDeliveryFeeDialogOpen(false);
    setSelectedOrderId(null);
  };

  const handleProcessOrder = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  // Quotation processing functions
  const handleRespondToQuotation = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setQuotationPrice("");
    setQuotationMessage("");
    setQuotationResponseOpen(true);
  };

  const handleConfirmQuotationResponse = async () => {
    if (!selectedQuotationId || !quotationPrice) return;
    const price = parseFloat(quotationPrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    await respondToQuotation(selectedQuotationId, {
      price,
      message: quotationMessage,
      validDays: 7,
    });
    setQuotationResponseOpen(false);
    setSelectedQuotationId(null);
  };

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "outline",
      confirmed: "secondary",
      processing: "secondary",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return variants[status] || "outline";
  };

  const getQuotationStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "outline",
      reviewed: "secondary",
      quoted: "default",
      accepted: "default",
      rejected: "destructive",
      expired: "secondary",
    };
    return variants[status] || "outline";
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Merchant Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-foreground">{stats.revenue.toLocaleString()} Tsh</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.pendingOrders}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">
              Orders
              {stats.pendingOrders > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                  {stats.pendingOrders}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quotations">
              Quotations
              {quotations.filter(q => q.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                  {quotations.filter(q => q.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {conversations.filter(c => c.unread).length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                  {conversations.filter(c => c.unread).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4 mt-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xl font-bold text-foreground">Product Catalog</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button
                  onClick={handleAddProduct}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {productsLoading ? (
                <Card className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3 animate-pulse" />
                  <p className="text-muted-foreground">Loading products...</p>
                </Card>
              ) : products.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No products yet. Add your first product!</p>
                </Card>
              ) : (
                products.map((product) => {
                  const displayImage = product.image_urls?.[0] || product.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop";
                  const imageCount = product.image_urls?.length || (product.image_url ? 1 : 0);
                  const isService = product.item_type === "service";
                  
                  return (
                    <Card key={product.id} className="p-4">
                      <div className="flex gap-4">
                        <div className="relative">
                          <img
                            src={displayImage}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop";
                            }}
                          />
                          {imageCount > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              +{imageCount - 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                                {isService && (
                                  <Badge variant="outline" className="text-xs">Service</Badge>
                                )}
                                {!product.is_active && (
                                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                              <p className="font-bold text-accent mt-1">
                                {product.price !== null ? `${product.price.toLocaleString()} Tsh` : "Request Quote"}
                              </p>
                              {!isService && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Stock: {product.stock} {product.unit}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">Customer Orders</h2>
            <div className="space-y-3">
              {ordersLoading ? (
                <Card className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3 animate-pulse" />
                  <p className="text-muted-foreground">Loading orders...</p>
                </Card>
              ) : orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No orders yet.</p>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_full_name}</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_phone}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getOrderStatusBadge(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="font-bold text-foreground mt-2">
                            {order.total_amount.toLocaleString()} Tsh
                          </p>
                          {order.delivery_fee > 0 && (
                            <p className="text-xs text-muted-foreground">
                              (incl. {order.delivery_fee.toLocaleString()} Tsh delivery)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.product_name} x {item.quantity}
                              </span>
                              <span className="text-foreground">
                                {item.price.toLocaleString()} Tsh
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium text-foreground mb-1">Delivery:</p>
                        <p className="text-sm text-muted-foreground">
                          {order.delivery_street}, {order.delivery_district}, {order.delivery_region}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 border-t pt-3">
                        {order.status === "pending" && (
                          <>
                            {order.delivery_fee === 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetDeliveryFee(order.id)}
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Set Delivery Fee
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                              onClick={() => handleProcessOrder(order.id, "confirmed")}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm Order
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleProcessOrder(order.id, "cancelled")}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleProcessOrder(order.id, "processing")}
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Start Processing
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleProcessOrder(order.id, "shipped")}
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Mark as Shipped
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleProcessOrder(order.id, "delivered")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark as Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">Quotation Requests</h2>
            <div className="space-y-3">
              {quotationsLoading ? (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3 animate-pulse" />
                  <p className="text-muted-foreground">Loading quotations...</p>
                </Card>
              ) : quotations.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No quotation requests yet.</p>
                </Card>
              ) : (
                quotations.map((quotation) => (
                  <Card key={quotation.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">Quotation #{quotation.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(quotation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getQuotationStatusBadge(quotation.status)}>
                          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Message */}
                      {quotation.message && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm text-foreground">{quotation.message}</p>
                        </div>
                      )}

                      {/* Quotation Items */}
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium text-foreground mb-2">Requested Items:</p>
                        <div className="space-y-2">
                          {quotation.quotation_items?.map((item) => (
                            <div key={item.id} className="text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium text-foreground">
                                  {item.product_name} x {item.quantity}
                                </span>
                              </div>
                              {item.specifications && (
                                <p className="text-muted-foreground text-xs">
                                  Specs: {item.specifications}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Response (if quoted) */}
                      {quotation.status === "quoted" && quotation.quoted_price && (
                        <div className="border-t pt-3 bg-accent/10 -mx-4 px-4 py-3 -mb-4 rounded-b-lg">
                          <p className="text-sm font-medium text-foreground">Your Quote:</p>
                          <p className="text-lg font-bold text-accent">
                            {quotation.quoted_price.toLocaleString()} Tsh
                          </p>
                          {quotation.merchant_response && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {quotation.merchant_response}
                            </p>
                          )}
                          {quotation.valid_until && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Valid until: {new Date(quotation.valid_until).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {quotation.status === "pending" && (
                        <div className="flex gap-2 border-t pt-3">
                          <Button
                            size="sm"
                            onClick={() => updateQuotationStatus(quotation.id, "reviewed")}
                            variant="outline"
                          >
                            Mark as Reviewed
                          </Button>
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleRespondToQuotation(quotation.id)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send Quote
                          </Button>
                        </div>
                      )}
                      {quotation.status === "reviewed" && (
                        <div className="flex gap-2 border-t pt-3">
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => handleRespondToQuotation(quotation.id)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send Quote
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4 mt-6">
            {!selectedConversation ? (
              <>
                <h2 className="text-xl font-bold text-foreground">Customer Messages</h2>
                {chatLoading ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Loading conversations...</p>
                  </Card>
                ) : conversations.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No customer messages yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conv) => (
                      <Card
                        key={conv.id}
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedConversation(conv.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              Customer {conv.user_id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.last_message || "No messages yet"}
                            </p>
                          </div>
                          {conv.unread && (
                            <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-foreground">
                    Customer {selectedConv?.user_id.slice(0, 8)}
                  </h2>
                </div>

                <Card className="p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === "merchant" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            message.sender_type === "merchant"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {message.text && <p className="text-sm">{message.text}</p>}
                          {message.image_url && (
                            <img
                              src={message.image_url}
                              alt="Shared"
                              className="rounded mt-2 max-w-full"
                            />
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </Card>

                <div className="flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Sales Analytics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-bold text-foreground">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completed Orders</span>
                  <span className="font-bold text-foreground">
                    {orders.filter(o => o.status === "delivered").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-bold text-accent">
                    {orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()} Tsh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending Quotations</span>
                  <span className="font-bold text-foreground">
                    {quotations.filter(q => q.status === "pending" || q.status === "reviewed").length}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <h2 className="text-xl font-bold text-foreground">Shop Settings</h2>

            {/* Profile & Background Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shop Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Background Image */}
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  {isEditingProfile ? (
                    <ImageUpload
                      value={editedProfile.backgroundImage}
                      onChange={(url) => setEditedProfile({ ...editedProfile, backgroundImage: url })}
                      bucket="merchant-images"
                      folder="backgrounds"
                      aspectRatio="banner"
                      placeholder="Upload background image"
                    />
                  ) : (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={shopProfile.backgroundImage}
                        alt="Shop background"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Profile Image */}
                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <div className="flex items-center gap-4">
                    {isEditingProfile ? (
                      <div className="w-32">
                        <ImageUpload
                          value={editedProfile.profileImage}
                          onChange={(url) => setEditedProfile({ ...editedProfile, profileImage: url })}
                          bucket="merchant-images"
                          folder="profiles"
                          aspectRatio="square"
                          placeholder="Upload"
                        />
                      </div>
                    ) : (
                      <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                        <AvatarImage
                          src={shopProfile.profileImage}
                          alt={shopProfile.name}
                        />
                        <AvatarFallback className="text-2xl">{shopProfile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    {!isEditingProfile && (
                      <p className="text-sm text-muted-foreground">
                        Click "Edit Profile" to change your shop images
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shop Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shop Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Shop Name</Label>
                  {isEditingProfile ? (
                    <Input
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      placeholder="Enter shop name"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{shopProfile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  {isEditingProfile ? (
                    <Textarea
                      value={editedProfile.description}
                      onChange={(e) => setEditedProfile({ ...editedProfile, description: e.target.value })}
                      placeholder="Describe your shop..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground">{shopProfile.description}</p>
                  )}
                </div>

                {/* Business Category */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Business Category
                  </Label>
                  {isEditingProfile ? (
                    <Select
                      value={editedProfile.category}
                      onValueChange={(value) => setEditedProfile({ ...editedProfile, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter(c => c !== "All").map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">
                      {shopProfile.category || "Not set"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Location
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        value={editedProfile.location}
                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                        placeholder="Enter location"
                      />
                    ) : (
                      <p className="text-foreground">{shopProfile.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-foreground">{shopProfile.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </Label>
                    {isEditingProfile ? (
                      <Input
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        placeholder="Enter email"
                        type="email"
                      />
                    ) : (
                      <p className="text-foreground">{shopProfile.email}</p>
                    )}
                  </div>

                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Operating Hours
                  </Label>
                  {isEditingProfile ? (
                    <Input
                      value={editedProfile.operatingHours}
                      onChange={(e) => setEditedProfile({ ...editedProfile, operatingHours: e.target.value })}
                      placeholder="e.g., Mon-Sat: 8:00 AM - 6:00 PM"
                    />
                  ) : (
                    <p className="text-foreground">{shopProfile.operatingHours || "Not set"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              {isEditingProfile ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditedProfile(shopProfile);
                      setIsEditingProfile(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={async () => {
                      // Save to database
                      if (merchantProfile?.id) {
                        const { error } = await supabase
                          .from("merchant_profiles")
                          .update({
                            profile_image_url: editedProfile.profileImage || null,
                            background_image_url: editedProfile.backgroundImage || null,
                            description: editedProfile.description || null,
                            phone_number: editedProfile.phone || null,
                            email: editedProfile.email || null,
                            operating_hours: editedProfile.operatingHours ? { display: editedProfile.operatingHours } : null,
                            category: editedProfile.category || null,
                          })
                          .eq("id", merchantProfile.id);
                        
                        if (error) {
                          toast.error("Failed to save profile");
                          console.error("Error saving profile:", error);
                          return;
                        }

                      }
                      setShopProfile(editedProfile);
                      setIsEditingProfile(false);
                      toast.success("Shop profile updated successfully!");
                    }}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditingProfile(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <ProductFormDialog
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
        saving={saving}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onUpload={handleBulkUpload}
      />

      {/* Delivery Fee Dialog */}
      <Dialog open={deliveryFeeDialogOpen} onOpenChange={setDeliveryFeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Delivery Fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Delivery Fee (Tsh)</Label>
              <Input
                type="number"
                placeholder="Enter delivery fee"
                value={deliveryFeeInput}
                onChange={(e) => setDeliveryFeeInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliveryFeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleConfirmDeliveryFee}
            >
              Set Fee & Notify Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quotation Response Dialog */}
      <Dialog open={quotationResponseOpen} onOpenChange={setQuotationResponseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quoted Price (Tsh)</Label>
              <Input
                type="number"
                placeholder="Enter quoted price"
                value={quotationPrice}
                onChange={(e) => setQuotationPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message to Customer</Label>
              <Textarea
                placeholder="Add any notes or terms..."
                value={quotationMessage}
                onChange={(e) => setQuotationMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuotationResponseOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleConfirmQuotationResponse}
            >
              Send Quotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantDashboard;
