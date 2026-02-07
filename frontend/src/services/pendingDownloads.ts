// Система управления незавершенными загрузками

import { downloadQueueManager, QueueItem } from './downloadQueue';

// Интерфейс для незавершенной загрузки
export interface PendingDownload {
  id: string;
  url: string;
  formatID: string;
  outputPath: string;
  title: string;
  status: QueueItem['status'];
  progress: number;
  priority: QueueItem['priority'];
  addedAt: Date;
  completedAt?: Date;
  resumedFrom?: number; // Байты, с которых возобновить загрузку
}

class PendingDownloadsManager {
  private storageKey = 'godlp_pending_downloads';

  // Сохранить незавершенные загрузки
  savePendingDownloads(): void {
    const pendingItems = downloadQueueManager.getAll().filter(item =>
      item.status === 'pending' || item.status === 'in-progress'
    );

    // Если нет незавершенных загрузок, очищаем localStorage
    if (pendingItems.length === 0) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    const serializedPending = pendingItems.map(item => ({
      ...item,
      addedAt: item.addedAt.toISOString(),
      ...(item.completedAt ? { completedAt: item.completedAt.toISOString() } : {})
    }));

    localStorage.setItem(this.storageKey, JSON.stringify(serializedPending));
  }

  // Восстановить незавершенные загрузки
  restorePendingDownloads(): PendingDownload[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to restore pending downloads:', error);
      return [];
    }
  }

  // Очистить список незавершенных загрузок
  clearPendingDownloads(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Возобновить незавершенные загрузки
  resumePendingDownloads(): void {
    const pending = this.restorePendingDownloads();
    
    for (const item of pending) {
      // Добавляем в очередь только те, которые не были завершены
      if (item.status === 'pending' || item.status === 'in-progress') {
        downloadQueueManager.addToQueue({
          url: item.url,
          formatID: item.formatID,
          outputPath: item.outputPath,
          title: item.title,
          priority: item.priority || 'normal'
        });
      }
    }
    
    // После восстановления удаляем из хранилища
    this.clearPendingDownloads();
  }
}

// Глобальный экземпляр менеджера незавершенных загрузок
export const pendingDownloadsManager = new PendingDownloadsManager();