import { useState, useCallback } from 'react';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { BarcodeTable } from '@/components/BarcodeTable';
import { BarcodeItem, ScanResult } from '@/types/barcode';
import { exportToExcel } from '@/utils/excel-export';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Scan, CheckCircle } from 'lucide-react';

const Index = () => {
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [pendingScan, setPendingScan] = useState<ScanResult | null>(null);
  const [description, setDescription] = useState('');

  const handleScanSuccess = useCallback((result: ScanResult) => {
    // Check if barcode already exists
    const existingItem = items.find(item => item.code === result.code);
    
    if (existingItem) {
      toast({
        title: "Barcode Already Exists",
        description: `This barcode (${result.code}) was already scanned.`,
        variant: "destructive",
      });
      return;
    }

    setPendingScan(result);
    setDescription('');
  }, [items]);

  const handleAddItem = () => {
    if (!pendingScan) return;

    const newItem: BarcodeItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: pendingScan.code,
      description: description.trim(),
      scannedAt: new Date(),
      updatedAt: new Date()
    };

    setItems(prev => [newItem, ...prev]);
    setPendingScan(null);
    setDescription('');
    
    toast({
      title: "Barcode Added Successfully",
      description: `Added ${pendingScan.code} to inventory.`,
      className: "border-success bg-success/10",
    });
  };

  const handleUpdateItem = (updatedItem: BarcodeItem) => {
    setItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    
    toast({
      title: "Item Updated",
      description: "The item description has been updated.",
    });
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Item Deleted",
      description: "The item has been removed from inventory.",
      variant: "destructive",
    });
  };

  const handleExportToExcel = () => {
    if (items.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Scan some barcodes first before exporting.",
        variant: "destructive",
      });
      return;
    }
    
    exportToExcel(items);
    
    toast({
      title: "Export Successful",
      description: `Exported ${items.length} items to Excel.`,
      className: "border-success bg-success/10",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Scan className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Barcode Scanner</h1>
                <p className="text-sm text-muted-foreground">Professional inventory management system</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {items.length} items scanned
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div>
            <BarcodeScanner onScanSuccess={handleScanSuccess} />
          </div>
          
          {/* Table Section */}
          <div className="lg:col-span-1">
            <BarcodeTable
              items={items}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onExportToExcel={handleExportToExcel}
            />
          </div>
        </div>

        {/* Full-width table on smaller screens */}
        <div className="lg:hidden">
          <BarcodeTable
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onExportToExcel={handleExportToExcel}
          />
        </div>
      </main>

      {/* Add Description Dialog */}
      <Dialog open={!!pendingScan} onOpenChange={() => setPendingScan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Barcode Scanned Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Barcode</Label>
              <div className="mt-1">
                <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                  {pendingScan?.code}
                </Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this item..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddItem} className="flex-1 bg-gradient-success hover:opacity-90">
                Add to Inventory
              </Button>
              <Button variant="outline" onClick={() => setPendingScan(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;