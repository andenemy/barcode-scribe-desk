import { useState } from 'react';
import { StockItem, ScanResult } from '@/types/stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface AddStockItemProps {
  scanResult: ScanResult | null;
  categories: string[];
  locations: string[];
  onAdd: (item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  onCancel: () => void;
}

export function AddStockItem({ scanResult, categories, locations, onAdd, onCancel }: AddStockItemProps) {
  const [formData, setFormData] = useState({
    barcode: scanResult?.code || '',
    name: '',
    description: '',
    quantity: 1,
    unit: 'pcs',
    category: categories[0] || '',
    location: locations[0] || '',
    minQuantity: undefined as number | undefined,
    maxQuantity: undefined as number | undefined,
    cost: undefined as number | undefined,
    price: undefined as number | undefined,
    supplier: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <Dialog open={!!scanResult} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Add New Stock Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label>Barcode</Label>
            <div className="mt-1">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {formData.barcode}
              </Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name..."
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., pcs, kg, liters"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger id="category">
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
              <Label htmlFor="location">Location *</Label>
              <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                <SelectTrigger id="location">
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
              <Label htmlFor="minQuantity">Minimum Quantity (Alert Threshold)</Label>
              <Input
                id="minQuantity"
                type="number"
                value={formData.minQuantity || ''}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || undefined })}
                placeholder="Optional"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="maxQuantity">Maximum Quantity</Label>
              <Input
                id="maxQuantity"
                type="number"
                value={formData.maxQuantity || ''}
                onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || undefined })}
                placeholder="Optional"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost (per unit)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost || ''}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="price">Selling Price (per unit)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Supplier name (optional)"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional information..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add to Inventory
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
