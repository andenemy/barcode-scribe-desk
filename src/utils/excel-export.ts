import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { BarcodeItem } from '@/types/barcode';
import { format } from 'date-fns';

export function exportToExcel(items: BarcodeItem[]): void {
  // Prepare data for Excel
  const data = items.map(item => ({
    'Barcode': item.code,
    'Description': item.description || 'No description',
    'Scanned Date': format(item.scannedAt, 'yyyy-MM-dd HH:mm:ss'),
    'Last Updated': format(item.updatedAt, 'yyyy-MM-dd HH:mm:ss')
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Barcode
    { wch: 40 }, // Description
    { wch: 20 }, // Scanned Date
    { wch: 20 }  // Last Updated
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Barcode Inventory');

  // Generate Excel file and trigger download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const fileName = `barcode-inventory-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
  saveAs(file, fileName);
}