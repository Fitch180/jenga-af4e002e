import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Star, Package, ShoppingCart, BarChart3 } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  user_id: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number | null;
}

interface DashboardAnalyticsProps {
  orders: Order[];
  products: Product[];
  quotationsCount: number;
}

const DashboardAnalytics = ({ orders, products, quotationsCount }: DashboardAnalyticsProps) => {
  const analytics = useMemo(() => {
    const delivered = orders.filter(o => o.status === "delivered");
    const totalRevenue = delivered.reduce((sum, o) => sum + o.total_amount, 0);
    const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;
    const avgOrderValue = delivered.length > 0 ? totalRevenue / delivered.length : 0;

    // Monthly revenue (last 6 months)
    const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleString("default", { month: "short" });
      const monthOrders = delivered.filter(o => o.created_at.startsWith(monthKey));
      monthlyRevenue.push({
        month: monthLabel,
        revenue: monthOrders.reduce((s, o) => s + o.total_amount, 0),
        orders: monthOrders.length,
      });
    }
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

    // Top categories
    const categoryCount: Record<string, number> = {};
    products.forEach(p => { categoryCount[p.category] = (categoryCount[p.category] || 0) + 1; });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Order status breakdown
    const statusBreakdown: Record<string, number> = {};
    orders.forEach(o => { statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1; });

    return { totalRevenue, uniqueCustomers, avgOrderValue, monthlyRevenue, maxRevenue, topCategories, statusBreakdown, deliveredCount: delivered.length };
  }, [orders, products]);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500", confirmed: "bg-blue-500", processing: "bg-purple-500",
    shipped: "bg-indigo-500", delivered: "bg-green-500", cancelled: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-lg font-bold text-foreground">{analytics.totalRevenue.toLocaleString()} Tsh</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Customers</span>
          </div>
          <p className="text-lg font-bold text-foreground">{analytics.uniqueCustomers}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Avg Order</span>
          </div>
          <p className="text-lg font-bold text-foreground">{Math.round(analytics.avgOrderValue).toLocaleString()} Tsh</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Quotations</span>
          </div>
          <p className="text-lg font-bold text-foreground">{quotationsCount}</p>
        </Card>
      </div>

      {/* Revenue Chart (CSS bars) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {analytics.monthlyRevenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{m.orders}</span>
                <div
                  className="w-full bg-accent/80 rounded-t-sm min-h-[4px] transition-all"
                  style={{ height: `${(m.revenue / analytics.maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors[status] || "bg-gray-400"}`} />
                  <span className="text-sm capitalize text-foreground">{status}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet</p>
            ) : (
              analytics.topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{cat}</span>
                  <span className="text-sm font-semibold text-foreground">{count} products</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
