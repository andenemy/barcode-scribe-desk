import { useState, useEffect, useCallback } from 'react';
import { StockItem, ScanResult, StockStats } from '@/types/stock';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { StockDashboard } from '@/components/StockDashboard';
import { StockTable } from '@/components/StockTable';
import { AddStockItem } from '@/components/AddStockItem';
import { ManageSettings } from '@/components/ManageSettings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  saveStockItems, 
  loadStockItems, 
  saveCategories, 
  loadCategories,
  saveLocations,
  loadLocations
} from '@/utils/storage';
import { 
  exportToExcel, 
  exportToCSV, 
  importFromFile,
  exportTemplate 
} from '@/utils/stock-import-export';
import { Scan, BarChart3, Package, FileDown } from 'lucide-react';

export default function StockTake() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [pendingScan, setPendingScan] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState('scan');

  // Load data from localStorage on mount
  useEffect(() => {
    setItems(loadStockItems());
    setCategories(loadCategories());
    setLocations(loadLocations());
  }, []);

  // Auto-save items whenever they change
  useEffect(() => {
    if (items.length > 0) {
      saveStockItems(items);
    }
  }, [items]);

  // Auto-save categories and locations
  useEffect(() => {
    if (categories.length > 0) {
      saveCategories(categories);
    }
  }, [categories]);

  useEffect(() => {
    if (locations.length > 0) {
      saveLocations(locations);
    }
  }, [locations]);

  // Calculate statistics
  const stats: StockStats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + ((item.cost || 0) * item.quantity), 0),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    lowStockItems: items.filter(item => item.minQuantity && item.quantity <= item.minQuantity && item.quantity > 0).length,
    outOfStockItems: items.filter(item => item.quantity === 0).length,
    categories: categories.length,
    locations: locations.length
  };

  const handleScanSuccess = useCallback((result: ScanResult) => {
    // Check if barcode already exists
    const existingItem = items.find(item => item.barcode === result.code);
    
    if (existingItem) {
      // Item exists - increase quantity
      const updatedItem: StockItem = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
        updatedAt: new Date(),
        history: [
          ...existingItem.history,
          {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            action: 'scan',
            field: 'quantity',
            oldValue: existingItem.quantity,
            newValue: existingItem.quantity + 1,
            notes: 'Scanned - quantity increased'
          }
        ]
      };
      
      setItems(prev => prev.map(item => item.id === existingItem.id ? updatedItem : item));
      
      toast({
        title: "Item Scanned",
        description: `${existingItem.name} - Quantity updated to ${updatedItem.quantity}`,
        className: "border-blue-500 bg-blue-50",
      });
    } else {
      // New item - show add dialog
      setPendingScan(result);
    }
  }, [items]);

  const handleAddItem = (itemData: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          action: 'add',
          notes: 'Item added to inventory'
        }
      ]
    };

    setItems(prev => [newItem, ...prev]);
    setPendingScan(null);
    
    toast({
      title: "Item Added Successfully",
      description: `${newItem.name} has been added to inventory.`,
      className: "border-green-500 bg-green-50",
    });
  };

  const handleUpdateItem = (updatedItem: StockItem) => {
    setItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    
    toast({
      title: "Item Updated",
      description: "The item has been updated successfully.",
    });
  };

  const handleDeleteItem = (id: string) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Item Deleted",
      description: item ? `${item.name} has been removed from inventory.` : "Item removed.",
      variant: "destructive",
    });
  };

  const handleExport = () => {
    if (items.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Add some items to inventory first.",
        variant: "destructive",
      });
      return;
    }
    
    exportToExcel(items);
    
    toast({
      title: "Export Successful",
      description: `Exported ${items.length} items to Excel.`,
      className: "border-green-500 bg-green-50",
    });
  };

  const handleImport = async (file: File) => {
    try {
      const importedItems = await importFromFile(file);
      
      let addedCount = 0;
      let updatedCount = 0;
      
      importedItems.forEach(importedItem => {
        if (!importedItem.barcode || !importedItem.name) return;
        
        const existingItem = items.find(item => item.barcode === importedItem.barcode);
        
        if (existingItem) {
          // Update existing item
          const updated: StockItem = {
            ...existingItem,
            ...importedItem,
            id: existingItem.id,
            createdAt: existingItem.createdAt,
            updatedAt: new Date(),
            history: [
              ...existingItem.history,
              {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
                action: 'update',
                notes: 'Updated via import'
              }
            ]
          };
          handleUpdateItem(updated);
          updatedCount++;
        } else {
          // Add new item
          const newItem: StockItem = {
            ...importedItem as any,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            history: [
              {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
                action: 'add',
                notes: 'Added via import'
              }
            ]
          };
          setItems(prev => [...prev, newItem]);
          addedCount++;
        }
      });
      
      toast({
        title: "Import Successful",
        description: `Added ${addedCount} new items, updated ${updatedCount} existing items.`,
        className: "border-green-500 bg-green-50",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stock Take Pro</h1>
                <p className="text-sm text-gray-600">Professional inventory management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportTemplate}>
                <FileDown className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <ManageSettings
                categories={categories}
                locations={locations}
                onAddCategory={(cat) => setCategories(prev => [...prev, cat])}
                onRemoveCategory={(cat) => setCategories(prev => prev.filter(c => c !== cat))}
                onAddLocation={(loc) => setLocations(prev => [...prev, loc])}
                onRemoveLocation={(loc) => setLocations(prev => prev.filter(l => l !== loc))}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="scan" className="gap-2">
              <Scan className="h-4 w-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <BarcodeScanner onScanSuccess={handleScanSuccess} />
              <div className="lg:block hidden">
                <StockDashboard stats={stats} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <StockTable
              items={items}
              categories={categories}
              locations={locations}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onExport={handleExport}
              onImport={handleImport}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <StockDashboard stats={stats} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Item Dialog */}
      <AddStockItem
        scanResult={pendingScan}
        categories={categories}
        locations={locations}
        onAdd={handleAddItem}
        onCancel={() => setPendingScan(null)}
      />
    </div>
  );
}
