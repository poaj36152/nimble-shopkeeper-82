import { Card } from "@/components/ui/card";
import { AlertCircle, DollarSign, Package, Users } from "lucide-react";

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  className = "",
}: {
  title: string;
  value: string;
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
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Today's Sales"
          value="$1,234"
          icon={DollarSign}
          className="bg-primary/5"
        />
        <DashboardCard
          title="Total Products"
          value="156"
          icon={Package}
          className="bg-secondary/5"
        />
        <DashboardCard
          title="Outstanding Debts"
          value="$2,845"
          icon={Users}
          className="bg-destructive/5"
        />
        <DashboardCard
          title="Low Stock Items"
          value="8"
          icon={AlertCircle}
          className="bg-accent/5"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
          <p className="text-muted-foreground">No sales recorded today</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
          <p className="text-muted-foreground">No products below threshold</p>
        </Card>
      </div>
    </div>
  );
};

export default Index;