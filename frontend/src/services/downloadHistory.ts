// Система хранения истории загрузок с использованием IndexedDB

export interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  formatID: string;
  outputPath: string;
  status: 'completed' | 'failed' | 'cancelled';
  fileSize?: number;
  duration?: number; // in seconds
  dateAdded: Date;
  dateCompleted?: Date;
  downloadedAt?: Date; // Добавляем новое поле
  thumbnail?: string;
}

class DownloadHistoryDB {
  private dbName = 'GoDLP_DownloadHistory';
  private version = 1;
  private storeName = 'history';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): void {
    const request = indexedDB.open(this.dbName, this.version);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
    };

    request.onsuccess = () => {
      this.db = request.result;
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
        objectStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        objectStore.createIndex('status', 'status', { unique: false });
        objectStore.createIndex('title', 'title', { unique: false });
      }
    };
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addItem(item: Omit<DownloadHistoryItem, 'id' | 'dateAdded'>): Promise<string> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const historyItem: DownloadHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date(),
    };

    const request = store.add(historyItem);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(historyItem.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getItem(id: string): Promise<DownloadHistoryItem | undefined> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);

    const request = store.get(id);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllItems(): Promise<DownloadHistoryItem[]> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);

    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getItemsByStatus(status: DownloadHistoryItem['status']): Promise<DownloadHistoryItem[]> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('status');

    const request = index.getAll(IDBKeyRange.only(status));
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getRecentItems(limit: number = 10): Promise<DownloadHistoryItem[]> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);

    // Получаем все элементы и сортируем по дате добавления
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result.sort((a, b) => 
          b.dateAdded.getTime() - a.dateAdded.getTime()
        );
        resolve(items.slice(0, limit));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateItem(id: string, updates: Partial<DownloadHistoryItem>): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const existingItem = await this.getItem(id);
    if (!existingItem) {
      throw new Error(`Item with id ${id} not found`);
    }

    const updatedItem = { ...existingItem, ...updates };
    const request = store.put(updatedItem);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteItem(id: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const request = store.delete(id);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const request = store.clear();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Глобальный экземпляр базы данных истории
export const downloadHistoryDB = new DownloadHistoryDB();