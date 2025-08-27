export interface BarcodeItem {
  id: string;
  code: string;
  description: string;
  scannedAt: Date;
  updatedAt: Date;
}

export interface ScanResult {
  code: string;
  format?: string;
}