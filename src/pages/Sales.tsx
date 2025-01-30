import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Activity, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Product, Sale } from "@/types";

export default function Sales() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

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

  const { data: todaySales = [] } = useQuery({
    queryKey: ['sales', 'today', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*, products(*)')
        .eq('user_id', user?.id)
        .gte('created_at', today);
      
      if (error) throw error;
      return data as (Sale & { products: Product })[];
    },
    enabled: !!user?.id,
  });

  const addSaleMutation = useMutation({
    mutationFn: async (values: { product_id: string; quantity: number }) => {
      const product = products.find(p => p.id === values.product_id);
      if (!product) throw new Error('Product not found');
      if (product.stock < values.quantity) throw new Error('Insufficient stock');

      const total_amount = product.price * values.quantity;

      // Start a transaction
      const { error: saleError } = await supabase
        .from('sales')
        .insert([{
          product_id: values.product_id,
          quantity: values.quantity,
          total_amount,
          user_id: user?.id
        }]);
      
      if (saleError) throw saleError;

      // Update product stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: product.stock - values.quantity })
        .eq('id', values.product_id)
        .eq('user_id', user?.id);

      if (stockError) throw stockError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Sale recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record sale: ' + error.message);
    },
  });

  const form = useForm({
    defaultValues: {
      product_id: '',
      quantity: 1,
    },
  });

  const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addSaleMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (${product.price}) - {product.stock} in stock
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Record Sale</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todaySalesTotal.toFixed(2)}</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Today's sales
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Today's Sales</h2>
        <div className="grid gap-4">
          {todaySales.map((sale) => (
            <Card key={sale.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{sale.products.name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {sale.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${sale.total_amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sale.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}