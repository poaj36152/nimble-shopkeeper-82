import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Debt } from "@/types";

export default function Debts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading } = useQuery({
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

  const addDebtMutation = useMutation({
    mutationFn: async (newDebt: Omit<Debt, 'id' | 'created_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('debts')
        .insert([{ ...newDebt, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Debt recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record debt: ' + error.message);
    },
  });

  const updateDebtStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'paid' | 'overdue' }) => {
      const { error } = await supabase
        .from('debts')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Debt status updated');
    },
    onError: (error) => {
      toast.error('Failed to update debt status: ' + error.message);
    },
  });

  const form = useForm({
    defaultValues: {
      customer_name: '',
      amount: 0,
      due_date: '',
      status: 'pending' as const,
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Customer Debts</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Debt</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => addDebtMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Record Debt</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {debts.map((debt) => (
          <Card key={debt.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {debt.customer_name}
              </CardTitle>
              {debt.status === "overdue" && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${debt.amount}</div>
              <p className="text-xs text-muted-foreground">
                Due: {new Date(debt.due_date).toLocaleDateString()}
              </p>
              <div className="flex items-center justify-between mt-4">
                <div className={`text-xs ${
                  debt.status === "overdue" ? "text-red-500" : 
                  debt.status === "paid" ? "text-green-500" : 
                  "text-yellow-500"
                }`}>
                  {debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}
                </div>
                <Select
                  defaultValue={debt.status}
                  onValueChange={(value: 'pending' | 'paid' | 'overdue') => 
                    updateDebtStatusMutation.mutate({ id: debt.id, status: value })
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}