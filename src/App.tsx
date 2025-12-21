import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { OrderProvider } from "./contexts/OrderContext";
import { QuotationProvider } from "./contexts/QuotationContext";
import { PinnedProvider } from "./contexts/PinnedContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MerchantDetail from "./pages/MerchantDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Quotations from "./pages/Quotations";
import Journal from "./pages/Journal";
import PinnedItems from "./pages/PinnedItems";
import MerchantDashboard from "./pages/MerchantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Chat from "./pages/Chat";
import Services from "./pages/Services";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrderProvider>
        <QuotationProvider>
          <CartProvider>
            <PinnedProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
                <Route path="/merchant/:id" element={<MerchantDetail />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/pinned" element={<PinnedItems />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/services" element={<Services />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </PinnedProvider>
          </CartProvider>
        </QuotationProvider>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
