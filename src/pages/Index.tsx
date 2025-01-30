import { Card } from "@/components/ui/card";
import { AlertCircle, DollarSign, Package, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Product, Sale, Debt } from "@/types";

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  className = "",
}: {
  title: string;
  value: string | number;
  icon: any;
  className?: string;
}) => (
  <Card className={`p-6 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
      </div>
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
  </Card>
);

const Index = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const { data: todaySales = [] } = useQuery({
    queryKey: ['sales', 'today', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today);
      
      if (error) throw error;
      return data as Sale[];
    },
    enabled: !!user?.id,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user?.id,
  });

  const { data: debts = [] } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return data as Debt[];
    },
    enabled: !!user?.id,
  });

  const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const lowStockItems = products.filter(product => product.stock < 10);
  const outstandingDebtsTotal = debts.reduce((sum, debt) => sum + debt.amount, 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Today's Sales"
          value={`$${todaySalesTotal.toFixed(2)}`}
          icon={DollarSign}
          className="bg-primary/5"
        />
        <DashboardCard
          title="Total Products"
          value={products.length}
          icon={Package}
          className="bg-secondary/5"
        />
        <DashboardCard
          title="Outstanding Debts"
          value={`$${outstandingDebtsTotal.toFixed(2)}`}
          icon={Users}
          className="bg-destructive/5"
        />
        <DashboardCard
          title="Low Stock Items"
          value={lowStockItems.length}
          icon={AlertCircle}
          className="bg-accent/5"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          {todaySales.length > 0 ? (
            <div className="space-y-4">
              {todaySales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center">
                  <span>Product ID: {sale.product_id}</span>
                  <span className="font-semibold">${sale.total_amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No sales recorded today</p>
          )}
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
          {lowStockItems.length > 0 ? (
            <div className="space-y-4">
              {lowStockItems.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <span className="text-red-500">{product.stock} left</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No products below threshold</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;