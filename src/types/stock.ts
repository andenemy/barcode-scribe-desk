export interface StockItem {
  id: string;
  barcode: string;
  name: string;
  description: string;
  quantity: number;
  unit: string; // e.g., 'pcs', 'kg', 'liters'
  category: string;
  location: string;
  minQuantity?: number; // Minimum stock level for alerts
  maxQuantity?: number; // Maximum stock level
  cost?: number;
  price?: number;
  supplier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  history: StockHistory[];
}

export interface StockHistory {
  id: string;
  timestamp: Date;
  action: 'add' | 'update' | 'delete' | 'adjust_quantity' | 'scan';
  field?: string;
  oldValue?: any;
  newValue?: any;
  user?: string;
  notes?: string;
}

export interface ScanResult {
  code: string;
  format?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  type?: string; // e.g., 'warehouse', 'shelf', 'room'
}

export interface StockFilter {
  search?: string;
  category?: string;
  location?: string;
  lowStock?: boolean;
  noStock?: boolean;
}

export interface StockStats {
  totalItems: number;
  totalValue: number;
  totalQuantity: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: number;
  locations: number;
}
