import { useState } from 'react';
import { StockItem, StockFilter } from '@/types/stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Download, Upload, Pencil, Trash2, AlertTriangle, 
  Plus, Minus, Filter, X, ArrowUpDown, Package2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockTableProps {
  items: StockItem[];
  categories: string[];
  locations: string[];
  onUpdateItem: (item: StockItem) => void;
  onDeleteItem: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function StockTable({ 
  items, 
  categories, 
  locations, 
  onUpdateItem, 
  onDeleteItem, 
  onExport,
  onImport 
}: StockTableProps) {
  const [filter, setFilter] = useState<StockFilter>({});
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [sortField, setSortField] = useState<keyof StockItem>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof StockItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedItems = items
    .filter(item => {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        if (!item.name.toLowerCase().includes(searchLower) &&
            !item.barcode.toLowerCase().includes(searchLower) &&
            !item.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      if (filter.category && item.category !== filter.category) return false;
      if (filter.location && item.location !== filter.location) return false;
      if (filter.lowStock && item.quantity > (item.minQuantity || 0)) return false;
      if (filter.noStock && item.quantity > 0) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * multiplier;
      }
      return 0;
    });

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const adjustQuantity = (item: StockItem, change: number) => {
    const newQuantity = Math.max(0, item.quantity + change);
    onUpdateItem({
      ...item,
      quantity: newQuantity,
      updatedAt: new Date(),
      history: [
        ...item.history,
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          action: 'adjust_quantity',
          field: 'quantity',
          oldValue: item.quantity,
          newValue: newQuantity,
          notes: `Adjusted by ${change > 0 ? '+' : ''}${change}`
        }
      ]
    });
  };

  const getStockStatus = (item: StockItem) => {
    if (item.quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (item.minQuantity && item.quantity <= item.minQuantity) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-600">In Stock</Badge>;
  };

  const clearFilters = () => {
    setFilter({});
  };

  const hasActiveFilters = Object.values(filter).some(v => v);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Stock Inventory ({filteredAndSortedItems.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={filter.search || ''}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>
          
          <Select value={filter.category || 'all'} onValueChange={(v) => setFilter({ ...filter, category: v === 'all' ? undefined : v })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filter.location || 'all'} onValueChange={(v) => setFilter({ ...filter, location: v === 'all' ? undefined : v })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={filter.lowStock ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter({ ...filter, lowStock: !filter.lowStock })}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('barcode')}>
                  <div className="flex items-center gap-1">
                    Barcode <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Name <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center cursor-pointer" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center justify-center gap-1">
                    Quantity <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No items found. Start scanning to add items to inventory.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.barcode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.location}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => adjustQuantity(item, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-semibold w-12 text-center">
                          {item.quantity} {item.unit}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => adjustQuantity(item, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getStockStatus(item)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Item</DialogTitle>
                            </DialogHeader>
                            <EditItemForm
                              item={editingItem || item}
                              categories={categories}
                              locations={locations}
                              onSave={(updated) => {
                                onUpdateItem(updated);
                                setEditingItem(null);
                              }}
                              onCancel={() => setEditingItem(null)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this item?')) {
                              onDeleteItem(item.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

interface EditItemFormProps {
  item: StockItem;
  categories: string[];
  locations: string[];
  onSave: (item: StockItem) => void;
  onCancel: () => void;
}

function EditItemForm({ item, categories, locations, onSave, onCancel }: EditItemFormProps) {
  const [formData, setFormData] = useState(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date(),
      history: [
        ...formData.history,
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          action: 'update',
          notes: 'Item details updated'
        }
      ]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Barcode</Label>
        <Input value={formData.barcode} disabled className="font-mono" />
      </div>
      
      <div>
        <Label>Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Quantity *</Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            min="0"
            required
          />
        </div>
        <div>
          <Label>Unit *</Label>
          <Input
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., pcs, kg"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category *</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Location *</Label>
          <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Quantity</Label>
          <Input
            type="number"
            value={formData.minQuantity || ''}
            onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || undefined })}
            min="0"
          />
        </div>
        <div>
          <Label>Max Quantity</Label>
          <Input
            type="number"
            value={formData.maxQuantity || ''}
            onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || undefined })}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cost</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.cost || ''}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || undefined })}
            min="0"
          />
        </div>
        <div>
          <Label>Price</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
            min="0"
          />
        </div>
      </div>

      <div>
        <Label>Supplier</Label>
        <Input
          value={formData.supplier || ''}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
        />
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">Save Changes</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
