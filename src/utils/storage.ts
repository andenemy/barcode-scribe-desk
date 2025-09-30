import { StockItem } from '@/types/stock';

const STORAGE_KEYS = {
  STOCK_ITEMS: 'stocktake_items',
  CATEGORIES: 'stocktake_categories',
  LOCATIONS: 'stocktake_locations',
  SETTINGS: 'stocktake_settings'
};

// Stock Items
export function saveStockItems(items: StockItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save stock items:', error);
  }
}

export function loadStockItems(): StockItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS);
    if (!data) return [];
    
    const items = JSON.parse(data);
    // Convert date strings back to Date objects
    return items.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      history: item.history.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load stock items:', error);
    return [];
  }
}

// Categories
export function saveCategories(categories: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories:', error);
  }
}

export function loadCategories(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) return getDefaultCategories();
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load categories:', error);
    return getDefaultCategories();
  }
}

function getDefaultCategories(): string[] {
  return [
    'Electronics',
    'Furniture',
    'Office Supplies',
    'Food & Beverages',
    'Clothing',
    'Tools',
    'Other'
  ];
}

// Locations
export function saveLocations(locations: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  } catch (error) {
    console.error('Failed to save locations:', error);
  }
}

export function loadLocations(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (!data) return getDefaultLocations();
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load locations:', error);
    return getDefaultLocations();
  }
}

function getDefaultLocations(): string[] {
  return [
    'Warehouse A',
    'Warehouse B',
    'Storage Room 1',
    'Storage Room 2',
    'Retail Floor',
    'Back Office',
    'Other'
  ];
}

// Settings
interface AppSettings {
  autoSave: boolean;
  showLowStockAlerts: boolean;
  defaultUnit: string;
}

export function saveSettings(settings: Partial<AppSettings>): void {
  try {
    const current = loadSettings();
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return getDefaultSettings();
    return { ...getDefaultSettings(), ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return getDefaultSettings();
  }
}

function getDefaultSettings(): AppSettings {
  return {
    autoSave: true,
    showLowStockAlerts: true,
    defaultUnit: 'pcs'
  };
}

// Clear all data
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

// Export all data as JSON
export function exportAllData(): string {
  return JSON.stringify({
    items: loadStockItems(),
    categories: loadCategories(),
    locations: loadLocations(),
    settings: loadSettings(),
    exportDate: new Date().toISOString()
  }, null, 2);
}

// Import data from JSON
export function importAllData(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    if (data.items) saveStockItems(data.items);
    if (data.categories) saveCategories(data.categories);
    if (data.locations) saveLocations(data.locations);
    if (data.settings) saveSettings(data.settings);
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format');
  }
}
