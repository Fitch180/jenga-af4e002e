import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, ShoppingCart, TrendingUp, Plus, Edit, Trash2, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "@/data/mockData";
import { toast } from "sonner";
import ProductFormDialog from "@/components/merchant/ProductFormDialog";
import DeleteConfirmDialog from "@/components/merchant/DeleteConfirmDialog";
import BulkUploadDialog from "@/components/merchant/BulkUploadDialog";

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  priceModifier: string;
}

interface Product {
  id: string;
  merchantId: number;
  name: string;
  merchant: string;
  price: string;
  category: string;
  image: string;
  description?: string;
  variants?: ProductVariant[];
}

const mockQuotations = [
  { id: "QT-001", customer: "John Doe", items: "Ceramic Tiles x 50sqm", status: "pending", date: "2024-01-15" },
  { id: "QT-002", customer: "Jane Smith", items: "Wall Paint x 20L", status: "responded", date: "2024-01-14" },
  { id: "QT-003", customer: "Mike Johnson", items: "Floor Tiles x 30sqm", status: "accepted", date: "2024-01-13" },
];

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const merchantId = 1; // Mock merchant ID - will be from auth in production
  const merchantName = "Dar Ceramica Center";

  const [products, setProducts] = useState<Product[]>(
    PRODUCTS.filter((p) => p.merchantId === merchantId).map((p) => ({
      ...p,
      description: "",
      variants: [],
    }))
  );

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [stats] = useState({
    totalProducts: products.length,
    totalOrders: 24,
    revenue: "2,450,000",
    pendingOrders: 5,
  });

  const [orders] = useState([
    { id: "ORD-001", customer: "John Doe", items: 3, total: "125,000 Tsh", status: "pending" },
    { id: "ORD-002", customer: "Jane Smith", items: 1, total: "35,000 Tsh", status: "completed" },
    { id: "ORD-003", customer: "Mike Johnson", items: 5, total: "280,000 Tsh", status: "processing" },
  ]);

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

  const handleDeleteConfirm = () => {
    if (deletingProductId) {
      setProducts(products.filter((p) => p.id !== deletingProductId));
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  const handleSaveProduct = (productData: Omit<Product, "id" | "merchantId" | "merchant"> & { id?: string }) => {
    if (productData.id) {
      // Update existing product
      setProducts(
        products.map((p) =>
          p.id === productData.id
            ? { ...p, ...productData, merchantId, merchant: merchantName }
            : p
        )
      );
      toast.success("Product updated successfully");
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        merchantId,
        merchant: merchantName,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        image: productData.image,
        description: productData.description,
        variants: productData.variants,
      };
      setProducts([...products, newProduct]);
      toast.success("Product added successfully");
    }
  };

  const handleBulkUpload = (uploadedProducts: any[]) => {
    const newProducts = uploadedProducts.map((p, index) => ({
      id: `bulk-${Date.now()}-${index}`,
      merchantId,
      merchant: merchantName,
      name: p.name,
      price: p.price,
      category: p.category,
      image: p.image,
      description: p.description || "",
      variants: [],
    }));
    setProducts([...products, ...newProducts]);
    toast.success(`${newProducts.length} products uploaded successfully`);
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
                <p className="text-2xl font-bold text-foreground">{stats.revenue} Tsh</p>
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
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

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
              {products.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No products yet. Add your first product!</p>
                </Card>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="font-bold text-accent mt-1">{product.price}</p>
                            {product.variants && product.variants.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {product.variants.map((v) => (
                                  <Badge key={v.id} variant="outline" className="text-xs">
                                    {v.name}: {v.value}
                                  </Badge>
                                ))}
                              </div>
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
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="quotations" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">Quotation Requests</h2>
            <div className="space-y-3">
              {mockQuotations.map((quotation) => (
                <Card key={quotation.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">{quotation.id}</p>
                        <p className="text-sm text-muted-foreground">{quotation.customer}</p>
                        <p className="text-sm text-foreground mt-1">{quotation.items}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{quotation.date}</p>
                      <Badge
                        variant={
                          quotation.status === "accepted"
                            ? "default"
                            : quotation.status === "responded"
                            ? "secondary"
                            : "outline"
                        }
                        className="mt-1"
                      >
                        {quotation.status}
                      </Badge>
                      {quotation.status === "pending" && (
                        <Button size="sm" className="mt-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                      <p className="text-sm text-muted-foreground">{order.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{order.total}</p>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "processing"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Sales Analytics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-bold text-foreground">1,250,000 Tsh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Month</span>
                  <span className="font-bold text-foreground">980,000 Tsh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-bold text-accent">+27.5%</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <ProductFormDialog
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onUpload={handleBulkUpload}
      />
    </div>
  );
};

export default MerchantDashboard;
