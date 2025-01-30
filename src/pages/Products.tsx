import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const initialProducts: Product[] = [
  { id: 1, name: "Laptop", price: 999.99, stock: 50 },
  { id: 2, name: "Smartphone", price: 499.99, stock: 100 },
  { id: 3, name: "Headphones", price: 79.99, stock: 200 },
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products] = useState<Product[]>(initialProducts);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {product.name}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${product.price}</div>
              <p className="text-xs text-muted-foreground">
                {product.stock} in stock
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}