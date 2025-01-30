import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  {
    id: 1,
    title: "Sales Report",
    description: "Monthly sales performance analysis",
    date: "March 2024",
  },
  {
    id: 2,
    title: "Inventory Report",
    description: "Current stock levels and movements",
    date: "March 2024",
  },
  {
    id: 3,
    title: "Customer Debts Report",
    description: "Outstanding payments and due dates",
    date: "March 2024",
  },
];

export default function Reports() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {report.title}
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {report.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {report.date}
                </span>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}