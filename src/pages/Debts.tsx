import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";

interface Debt {
  id: number;
  customerName: string;
  amount: number;
  dueDate: string;
  status: "pending" | "overdue" | "paid";
}

const debts: Debt[] = [
  {
    id: 1,
    customerName: "John Doe",
    amount: 500,
    dueDate: "2024-03-15",
    status: "pending",
  },
  {
    id: 2,
    customerName: "Jane Smith",
    amount: 1200,
    dueDate: "2024-02-28",
    status: "overdue",
  },
];

export default function Debts() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Customer Debts</h1>
      </div>

      <div className="grid gap-6">
        {debts.map((debt) => (
          <Card key={debt.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                {debt.customerName}
              </CardTitle>
              {debt.status === "overdue" && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${debt.amount}</div>
              <p className="text-xs text-muted-foreground">
                Due: {new Date(debt.dueDate).toLocaleDateString()}
              </p>
              <div className={`text-xs mt-2 ${
                debt.status === "overdue" ? "text-red-500" : 
                debt.status === "paid" ? "text-green-500" : 
                "text-yellow-500"
              }`}>
                {debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}