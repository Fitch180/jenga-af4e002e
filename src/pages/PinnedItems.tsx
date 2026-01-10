import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pin, Trash2, Store, Package, ArrowLeft } from "lucide-react";
import { usePinned } from "@/contexts/PinnedContext";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PinnedItems = () => {
  const navigate = useNavigate();
  const { 
    pinnedMerchants,
    pinnedProducts: pinnedProductIds,
    toggleMerchantPin, 
    toggleProductPin,
  } = usePinned();
  const [activeTab, setActiveTab] = useState("merchants");

  // Fetch pinned merchants from database
  const { data: pinnedMerchantsList = [], isLoading: merchantsLoading } = useQuery({
    queryKey: ['pinned-merchants', pinnedMerchants],
    queryFn: async () => {
      if (pinnedMerchants.length === 0) return [];
      const { data, error } = await supabase
        .from('merchant_profiles')
        .select('*')
        .in('id', pinnedMerchants);
      if (error) throw error;
      return data || [];
    },
    enabled: pinnedMerchants.length > 0,
  });

  // Fetch pinned products from database
  const { data: pinnedProductsList = [], isLoading: productsLoading } = useQuery({
    queryKey: ['pinned-products', pinnedProductIds],
    queryFn: async () => {
      if (pinnedProductIds.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', pinnedProductIds);
      if (error) throw error;
      return data || [];
    },
    enabled: pinnedProductIds.length > 0,
  });

  const handleClearAllMerchants = () => {
    pinnedMerchantsList.forEach(m => toggleMerchantPin(m.id));
  };

  const handleClearAllProducts = () => {
    pinnedProductsList.forEach(p => toggleProductPin(p.id));
  };

  return (
    <div className="min-h-screen bg-background pb-6">
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
              <h1 className="text-2xl font-bold">Pinned Items</h1>
              <p className="text-primary-foreground/80 text-sm">
                Manage your saved merchants and products
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="merchants" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Merchants ({pinnedMerchants.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products ({pinnedProductIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="merchants" className="space-y-4 animate-fade-in">
            {merchantsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : pinnedMerchantsList.length > 0 ? (
              <>
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear all pinned merchants?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all {pinnedMerchantsList.length} merchants from your pinned items.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllMerchants}>
                          Clear All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  {pinnedMerchantsList.map((merchant) => (
                    <Card 
                      key={merchant.id} 
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer animate-scale-in"
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center gap-4">
                          <div 
                            className="flex items-center gap-4 flex-1 p-4"
                            onClick={() => navigate(`/merchant/${merchant.id}`)}
                          >
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary flex items-center justify-center">
                              <span className="text-2xl font-bold text-muted-foreground">
                                {merchant.business_name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {merchant.business_name}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {merchant.approval_status}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {merchant.country_registered}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMerchantPin(merchant.id);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Store className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pinned merchants</h3>
                <p className="text-muted-foreground text-sm">
                  Pin merchants from the Merchants tab to see them here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4 animate-fade-in">
            {productsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : pinnedProductsList.length > 0 ? (
              <>
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear all pinned products?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all {pinnedProductsList.length} products from your pinned items.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllProducts}>
                          Clear All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  {pinnedProductsList.map((product) => (
                    <Card 
                      key={product.id} 
                      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer animate-scale-in"
                    >
                      <CardContent className="p-0">
                        <div className="flex items-center gap-4">
                          <div 
                            className="flex items-center gap-4 flex-1 p-4"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {product.category}
                              </p>
                              <p className="text-sm font-medium text-primary">
                                {product.price ? `Tsh ${product.price.toLocaleString()}` : 'Price on request'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mr-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductPin(product.id);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No pinned products</h3>
                <p className="text-muted-foreground text-sm">
                  Pin products from the Products tab to see them here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PinnedItems;
