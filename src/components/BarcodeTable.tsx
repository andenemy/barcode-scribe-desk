import { useState } from 'react';
import { BarcodeItem } from '@/types/barcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Trash2, Package, Download } from 'lucide-react';
import { format } from 'date-fns';

interface BarcodeTableProps {
  items: BarcodeItem[];
  onUpdateItem: (item: BarcodeItem) => void;
  onDeleteItem: (id: string) => void;
  onExportToExcel: () => void;
}

export function BarcodeTable({ items, onUpdateItem, onDeleteItem, onExportToExcel }: BarcodeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<BarcodeItem | null>(null);
  const [editDescription, setEditDescription] = useState('');

  const filteredItems = items.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: BarcodeItem) => {
    setEditingItem(item);
    setEditDescription(item.description);
  };

  const handleSave = () => {
    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        description: editDescription,
        updatedAt: new Date()
      });
      setEditingItem(null);
      setEditDescription('');
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Scanned Items ({items.length})
          </div>
          <Button
            onClick={onExportToExcel}
            disabled={items.length === 0}
            className="bg-gradient-success hover:opacity-90"
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by barcode or description..."
            className="pl-10"
          />
        </div>

        {/* Table */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {items.length === 0 ? (
              <>
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No items scanned yet</p>
                <p>Start scanning barcodes to see them here</p>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No items match your search</p>
                <p>Try a different search term</p>
              </>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Barcode</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Scanned</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {item.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.description || (
                        <span className="text-muted-foreground italic">No description</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(item.scannedAt, 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(item.updatedAt, 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Item</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                  id="barcode"
                                  value={editingItem?.code || ''}
                                  readOnly
                                  className="font-mono bg-muted"
                                />
                              </div>
                              <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                  id="description"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Add a description for this item..."
                                  rows={3}
                                />
                              </div>
                              <Button onClick={handleSave} className="w-full">
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={editingItem.code}
                  readOnly
                  className="font-mono bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description for this item..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}