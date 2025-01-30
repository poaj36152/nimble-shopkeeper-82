export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
  user_id: string;
}

export interface Sale {
  id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  created_at: string;
  user_id: string;
}

export interface Debt {
  id: string;
  customer_name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'overdue' | 'paid';
  created_at: string;
  user_id: string;
}