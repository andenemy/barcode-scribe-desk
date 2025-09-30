import * as XLSX from 'xlsx';
import { StockItem } from '@/types/stock';
import { saveAs } from 'file-saver';

export function exportToExcel(items: StockItem[], filename: string = 'stock-inventory') {
  // Prepare data for export
  const exportData = items.map(item => ({
    Barcode: item.barcode,
    Name: item.name,
    Description: item.description,
    Quantity: item.quantity,
    Unit: item.unit,
    Category: item.category,
    Location: item.location,
    'Min Quantity': item.minQuantity || '',
    'Max Quantity': item.maxQuantity || '',
    Cost: item.cost || '',
    Price: item.price || '',
    Supplier: item.supplier || '',
    Notes: item.notes || '',
    'Created At': new Date(item.createdAt).toLocaleString(),
    'Updated At': new Date(item.updatedAt).toLocaleString()
  }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Barcode
    { wch: 20 }, // Name
    { wch: 30 }, // Description
    { wch: 10 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 15 }, // Category
    { wch: 15 }, // Location
    { wch: 12 }, // Min Quantity
    { wch: 12 }, // Max Quantity
    { wch: 10 }, // Cost
    { wch: 10 }, // Price
    { wch: 20 }, // Supplier
    { wch: 30 }, // Notes
    { wch: 20 }, // Created At
    { wch: 20 }  // Updated At
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Stock Inventory');

  // Generate file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(blob, `${filename}-${timestamp}.xlsx`);
}

export function exportToCSV(items: StockItem[], filename: string = 'stock-inventory') {
  // Prepare CSV data
  const headers = [
    'Barcode', 'Name', 'Description', 'Quantity', 'Unit', 'Category', 'Location',
    'Min Quantity', 'Max Quantity', 'Cost', 'Price', 'Supplier', 'Notes', 'Created At', 'Updated At'
  ];

  const rows = items.map(item => [
    item.barcode,
    item.name,
    item.description,
    item.quantity,
    item.unit,
    item.category,
    item.location,
    item.minQuantity || '',
    item.maxQuantity || '',
    item.cost || '',
    item.price || '',
    item.supplier || '',
    item.notes || '',
    new Date(item.createdAt).toLocaleString(),
    new Date(item.updatedAt).toLocaleString()
  ]);

  // Create CSV content
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(blob, `${filename}-${timestamp}.csv`);
}

export async function importFromFile(file: File): Promise<Partial<StockItem>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Map imported data to StockItem structure
        const items: Partial<StockItem>[] = jsonData.map((row: any) => ({
          barcode: row['Barcode']?.toString() || '',
          name: row['Name']?.toString() || '',
          description: row['Description']?.toString() || '',
          quantity: parseInt(row['Quantity']) || 0,
          unit: row['Unit']?.toString() || 'pcs',
          category: row['Category']?.toString() || 'Uncategorized',
          location: row['Location']?.toString() || 'Unknown',
          minQuantity: row['Min Quantity'] ? parseInt(row['Min Quantity']) : undefined,
          maxQuantity: row['Max Quantity'] ? parseInt(row['Max Quantity']) : undefined,
          cost: row['Cost'] ? parseFloat(row['Cost']) : undefined,
          price: row['Price'] ? parseFloat(row['Price']) : undefined,
          supplier: row['Supplier']?.toString() || '',
          notes: row['Notes']?.toString() || ''
        }));

        resolve(items);
      } catch (error) {
        reject(new Error('Failed to parse file. Please ensure it\'s a valid Excel or CSV file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

export function exportTemplate() {
  const templateData = [
    {
      Barcode: '123456789',
      Name: 'Sample Item',
      Description: 'Sample description',
      Quantity: 10,
      Unit: 'pcs',
      Category: 'Electronics',
      Location: 'Warehouse A',
      'Min Quantity': 5,
      'Max Quantity': 50,
      Cost: 10.50,
      Price: 15.99,
      Supplier: 'Sample Supplier',
      Notes: 'Sample notes'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  ws['!cols'] = [
    { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 10 },
    { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 10 }, { wch: 20 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Stock Template');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, 'stock-inventory-template.xlsx');
}
