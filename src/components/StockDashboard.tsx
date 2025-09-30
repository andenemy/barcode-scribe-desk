import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockStats } from '@/types/stock';
import { Package, TrendingDown, TrendingUp, AlertTriangle, DollarSign, MapPin, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StockDashboardProps {
  stats: StockStats;
}

export function StockDashboard({ stats }: StockDashboardProps) {
  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Unique products'
    },
    {
      title: 'Total Quantity',
      value: stats.totalQuantity,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Units in stock'
    },
    {
      title: 'Total Value',
      value: `$${stats.totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Inventory value'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockItems,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Items below minimum',
      alert: stats.lowStockItems > 0
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockItems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Items with 0 quantity',
      alert: stats.outOfStockItems > 0
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: FolderOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Product categories'
    },
    {
      title: 'Locations',
      value: stats.locations,
      icon: MapPin,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      description: 'Storage locations'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Dashboard</h2>
        {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {stats.lowStockItems + stats.outOfStockItems} Alerts
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={stat.alert ? 'border-orange-500 border-2' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
