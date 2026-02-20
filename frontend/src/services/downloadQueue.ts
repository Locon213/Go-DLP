import { apiService } from '../services/api';

// Типы для очереди загрузок
export interface QueueItem {
  id: string;
  url: string;
  formatID: string;
  outputPath: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  priority: 'low' | 'normal' | 'high';
  addedAt: Date;
  completedAt?: Date;
  speed?: string;
  size?: string;
  eta?: string;
}

// Класс для управления очередью загрузок
class DownloadQueueManager {
  private queue: QueueItem[] = [];
  private activeDownloads: Set<string> = new Set();
  private maxConcurrentDownloads: number = 1; // Один активный процесс yt-dlp, чтобы отмена не затрагивала другие элементы очереди
  private rateLimitDelay: number = 2000; // Задержка между запросами (2 секунды) - для совместимости
  private lastDownloadTime: number = 0; // Время последней загрузки
  private minTimeBetweenDownloads: number = 2000; // Минимальное время между загрузками
  private cancelingId: string | null = null;

  // Добавить элемент в очередь
  addToQueue(item: Omit<QueueItem, 'id' | 'status' | 'progress' | 'addedAt'>): QueueItem {
    // Проверяем на дубликаты по URL
    const isDuplicate = this.queue.some(q => q.url === item.url && q.status !== 'completed' && q.status !== 'failed' && q.status !== 'cancelled');
    if (isDuplicate) {
      console.warn(`Duplicate download detected for URL: ${item.url}, skipping`);
      return this.queue.find(q => q.url === item.url && q.status !== 'completed' && q.status !== 'failed' && q.status !== 'cancelled')!;
    }

    const queueItem: QueueItem = {
      id: `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      status: 'pending',
      progress: 0,
      addedAt: new Date(),
      outputPath: item.outputPath, // Сохраняем путь к файлу
    };

    this.queue.push(queueItem);
    this.processQueue();

    return queueItem;
  }

  // Получить все элементы очереди
  getAll(): QueueItem[] {
    return [...this.queue];
  }

  // Получить активные загрузки
  getActiveDownloads(): QueueItem[] {
    return this.queue.filter(item => this.activeDownloads.has(item.id));
  }

  // Получить элемент по ID
  getById(id: string): QueueItem | undefined {
    return this.queue.find(item => item.id === id);
  }

  // Обновить прогресс загрузки
  updateProgress(id: string, progress: number, speed?: string, size?: string, eta?: string): void {
    const item = this.queue.find(q => q.id === id);
    if (item) {
      item.progress = progress;
      // [FIX] Если значение передано (даже если это 'Calculating...'), обновляем его.
      // Если придет null/undefined, оставляем старое значение (или можно ставить дефолт).
      if (speed) item.speed = speed;
      if (size) item.size = size;
      if (eta) item.eta = eta;
    }
  }

  // Установить статус загрузки
  setStatus(id: string, status: QueueItem['status']): void {
    const item = this.queue.find(q => q.id === id);
    if (item) {
      item.status = status;
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        item.completedAt = new Date();
        this.activeDownloads.delete(id);
        this.processQueue(); // Продолжить обработку очереди
      } else if (status === 'in-progress') {
        this.activeDownloads.add(id);
      }
    }
  }

  // Отменить загрузку
  cancelDownload(id: string): void {
    const item = this.queue.find(q => q.id === id);
    if (item && (item.status === 'pending' || item.status === 'in-progress')) {
      // Попробовать отменить активную загрузку
      if (item.status === 'in-progress') {
        this.cancelingId = id;
        apiService.cancelDownload();
        return;
      }
      // Удаляем элемент из очереди вместо простого изменения статуса
      // Это предотвращает перезапуск отмененной загрузки
      this.removeFromQueue(id);
    }
  }

  getCancelingId(): string | null {
    return this.cancelingId;
  }

  clearCancelingId(): void {
    this.cancelingId = null;
  }

  resumeQueue(): void {
    this.processQueue();
  }

  // Удалить элемент из очереди
  removeFromQueue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.activeDownloads.delete(id);
    this.processQueue(); // запуск следующих задач при освобождении слота
  }

  // Очистить завершенные загрузки
  clearCompleted(): void {
    this.queue = this.queue.filter(item => 
      item.status !== 'completed' && 
      item.status !== 'failed' && 
      item.status !== 'cancelled'
    );
  }

  // Очистить всю очередь (все загрузки)
  clearAll(): void {
    this.queue = [];
    this.activeDownloads.clear();
  }

  // Очистить кеш (localStorage для pending downloads)
  clearCache(): void {
    // Очищаем localStorage для pending downloads
    localStorage.removeItem('godlp_pending_downloads');
  }

  // Обработать очередь
  private async processQueue(): Promise<void> {
    // Сортируем очередь по приоритету и времени добавления
    const pendingItems = [...this.queue]
      .filter(item => item.status === 'pending')
      .sort((a, b) => {
        // Приоритет: high > normal > low
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Если приоритет одинаковый, сначала более старые
        return a.addedAt.getTime() - b.addedAt.getTime();
      });

    // Запускаем новые загрузки, если есть свободные слоты
    const availableSlots = this.maxConcurrentDownloads - this.activeDownloads.size;
    const itemsToStart = pendingItems.slice(0, availableSlots);

    for (const item of itemsToStart) {
      this.startDownload(item.id);
    }
  }

  // Запустить загрузку
  private async startDownload(id: string): Promise<void> {
    const item = this.queue.find(q => q.id === id);
    if (!item || item.status !== 'pending') return;

    this.setStatus(id, 'in-progress');

    try {
      // Проверяем, прошло ли достаточно времени с последней загрузки
      const now = Date.now();
      const timeSinceLastDownload = now - this.lastDownloadTime;
      
      // Используем максимальное значение между установленной задержкой и минимальным временем между загрузками
      const requiredDelay = Math.max(this.rateLimitDelay, this.minTimeBetweenDownloads);
      
      if (timeSinceLastDownload < requiredDelay) {
        const delay = requiredDelay - timeSinceLastDownload;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Начинаем загрузку
      // Примечание: статус будет обновлен через событие download-complete из Wails
      // которое обрабатывается в useAppLogic.ts
      await apiService.downloadVideo(item.url, item.formatID, item.outputPath);
      
      // Обновляем время последней загрузки
      this.lastDownloadTime = Date.now();
      
      // НЕ устанавливаем статус здесь - статус будет установлен через событие download-complete
      // из Wails, которое обрабатывается в useAppLogic.ts
    } catch (error) {
      console.error(`Download failed for ${id}:`, error);
      // Устанавливаем статус failed только при ошибке запуска загрузки
      // Если загрузка началась, но не завершилась, статус будет установлен через событие download-error
      this.setStatus(id, 'failed');
    }
  }

  // Установить максимальное количество одновременных загрузок
  setMaxConcurrentDownloads(max: number): void {
    this.maxConcurrentDownloads = max;
    this.processQueue(); // Пересчитать очередь
  }

  // Установить задержку для rate limiting
  setRateLimitDelay(delay: number): void {
    this.rateLimitDelay = delay;
    // Также обновляем минимальное время между загрузками
    this.minTimeBetweenDownloads = delay;
  }
}

// Глобальный экземпляр менеджера очереди
export const downloadQueueManager = new DownloadQueueManager();
