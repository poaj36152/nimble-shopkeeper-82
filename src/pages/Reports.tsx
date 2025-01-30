import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, Sale, Debt } from "@/types";
import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Reports() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');

  const { data: salesData = [] } = useQuery({
    queryKey: ['sales', timeframe, user?.id],
    queryFn: async () => {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0));
      }

      const { data, error } = await supabase
        .from('sales')
        .select('*, products(*)')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      return data as (Sale & { products: Product })[];
    },
    enabled: !!user?.id,
  });

  const { data: debts = [] } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data as Debt[];
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

  const totalSales = salesData.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + (debt.status === 'pending' ? debt.amount : 0), 0);
  const lowStockProducts = products.filter(product => product.stock < 10);

  const chartData = salesData.reduce((acc: any[], sale) => {
    const date = new Date(sale.created_at).toLocaleDateString();
    const existingDate = acc.find(item => item.date === date);
    
    if (existingDate) {
      existingDate.amount += sale.total_amount;
    } else {
      acc.push({ date, amount: sale.total_amount });
    }
    
    return acc;
  }, []);

  const downloadReport = (reportType: string) => {
    let reportData = '';
    
    switch (reportType) {
      case 'sales':
        reportData = salesData.map(sale => 
          `${sale.created_at},${sale.products.name},${sale.quantity},${sale.total_amount}`
        ).join('\n');
        break;
      case 'inventory':
        reportData = products.map(product => 
          `${product.name},${product.price},${product.stock}`
        ).join('\n');
        break;
      case 'debts':
        reportData = debts.map(debt => 
          `${debt.customer_name},${debt.amount},${debt.due_date},${debt.status}`
        ).join('\n');
        break;
    }

    const blob = new Blob([reportData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Select value={timeframe} onValueChange={(value: 'day' | 'week' | 'month') => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Sales Report</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => downloadReport('sales')}>
              <Download className="h-4 w-4" />
            
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total sales for selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inventory Report</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => downloadReport('inventory')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Products with low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Outstanding Debts</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => downloadReport('debts')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDebts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total pending debts
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}