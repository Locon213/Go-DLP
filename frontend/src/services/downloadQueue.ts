import { apiService } from '../services/api';

export interface QueueItem {
  id: string;
  url: string;
  formatID: string;
  outputPath: string;
  title: string;
  status: 'pending' | 'in-progress' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  priority: 'low' | 'normal' | 'high';
  addedAt: Date;
  completedAt?: Date;
  speed?: string;
  size?: string;
  eta?: string;
}

class DownloadQueueManager {
  private queue: QueueItem[] = [];
  private activeDownloads: Set<string> = new Set();
  private maxConcurrentDownloads = 1;
  private rateLimitDelay = 2000;
  private lastDownloadTime = 0;
  private minTimeBetweenDownloads = 2000;
  private cancelingId: string | null = null;
  private cancelIntent: 'cancel' | 'pause' | null = null;

  addToQueue(item: Omit<QueueItem, 'id' | 'status' | 'progress' | 'addedAt'>): QueueItem {
    const isDuplicate = this.queue.some(
      q => q.url === item.url && q.status !== 'completed' && q.status !== 'failed' && q.status !== 'cancelled'
    );

    if (isDuplicate) {
      return this.queue.find(
        q => q.url === item.url && q.status !== 'completed' && q.status !== 'failed' && q.status !== 'cancelled'
      )!;
    }

    const queueItem: QueueItem = {
      id: `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      status: 'pending',
      progress: 0,
      addedAt: new Date(),
      outputPath: item.outputPath,
    };

    this.queue.push(queueItem);
    this.processQueue();
    return queueItem;
  }

  getAll(): QueueItem[] {
    return [...this.queue];
  }

  getActiveDownloads(): QueueItem[] {
    return this.queue.filter(item => this.activeDownloads.has(item.id));
  }

  getById(id: string): QueueItem | undefined {
    return this.queue.find(item => item.id === id);
  }

  updateProgress(id: string, progress: number, speed?: string, size?: string, eta?: string): void {
    const item = this.queue.find(q => q.id === id);
    if (!item) return;

    item.progress = progress;
    if (speed !== undefined) item.speed = speed;
    if (size !== undefined) item.size = size;
    if (eta !== undefined) item.eta = eta;
  }

  setStatus(id: string, status: QueueItem['status']): void {
    const item = this.queue.find(q => q.id === id);
    if (!item) return;

    item.status = status;

    if (status === 'completed' || status === 'failed' || status === 'cancelled' || status === 'paused') {
      item.completedAt = new Date();
      this.activeDownloads.delete(id);
      this.processQueue();
      return;
    }

    if (status === 'in-progress') {
      item.completedAt = undefined;
      this.activeDownloads.add(id);
      return;
    }

    if (status === 'pending') {
      item.completedAt = undefined;
      this.activeDownloads.delete(id);
    }
  }

  cancelDownload(id: string): void {
    const item = this.queue.find(q => q.id === id);
    if (!item || (item.status !== 'pending' && item.status !== 'in-progress' && item.status !== 'paused')) return;

    if (item.status === 'in-progress') {
      this.cancelingId = id;
      this.cancelIntent = 'cancel';
      void apiService.cancelDownload();
      return;
    }

    this.removeFromQueue(id);
  }

  pauseDownload(id: string): void {
    const item = this.queue.find(q => q.id === id);
    if (!item) return;

    if (item.status === 'in-progress') {
      this.cancelingId = id;
      this.cancelIntent = 'pause';
      void apiService.pauseDownload();
      return;
    }

    if (item.status === 'pending') {
      this.setStatus(id, 'paused');
    }
  }

  resumeDownload(id: string): void {
    const item = this.queue.find(q => q.id === id);
    if (!item || item.status !== 'paused') return;

    this.setStatus(id, 'pending');
    this.processQueue();
  }

  getCancelingId(): string | null {
    return this.cancelingId;
  }

  getCancelIntent(): 'cancel' | 'pause' | null {
    return this.cancelIntent;
  }

  clearCancelingId(): void {
    this.cancelingId = null;
  }

  clearCancelIntent(): void {
    this.cancelIntent = null;
  }

  resumeQueue(): void {
    this.processQueue();
  }

  removeFromQueue(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.activeDownloads.delete(id);
    this.processQueue();
  }

  clearCompleted(): void {
    this.queue = this.queue.filter(item => item.status !== 'completed' && item.status !== 'failed' && item.status !== 'cancelled');
  }

  clearAll(): void {
    this.queue = [];
    this.activeDownloads.clear();
  }

  clearCache(): void {
    localStorage.removeItem('godlp_pending_downloads');
  }

  private async processQueue(): Promise<void> {
    const pendingItems = [...this.queue]
      .filter(item => item.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.addedAt.getTime() - b.addedAt.getTime();
      });

    const availableSlots = this.maxConcurrentDownloads - this.activeDownloads.size;
    const itemsToStart = pendingItems.slice(0, availableSlots);

    for (const item of itemsToStart) {
      void this.startDownload(item.id);
    }
  }

  private async startDownload(id: string): Promise<void> {
    const item = this.queue.find(q => q.id === id);
    if (!item || item.status !== 'pending') return;

    this.setStatus(id, 'in-progress');

    try {
      const now = Date.now();
      const timeSinceLastDownload = now - this.lastDownloadTime;
      const requiredDelay = Math.max(this.rateLimitDelay, this.minTimeBetweenDownloads);

      if (timeSinceLastDownload < requiredDelay) {
        const delay = requiredDelay - timeSinceLastDownload;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await apiService.downloadVideo(item.url, item.formatID, item.outputPath);
      this.lastDownloadTime = Date.now();
    } catch (error) {
      if (this.cancelingId === id) {
        return;
      }
      console.error(`Download failed for ${id}:`, error);
      this.setStatus(id, 'failed');
    }
  }

  setMaxConcurrentDownloads(max: number): void {
    this.maxConcurrentDownloads = max;
    this.processQueue();
  }

  setRateLimitDelay(delay: number): void {
    this.rateLimitDelay = delay;
    this.minTimeBetweenDownloads = delay;
  }
}

export const downloadQueueManager = new DownloadQueueManager();

