// Сервис для работы с API Wails

import { EventsOn } from '../../wailsjs/runtime/runtime';
import { AnalyzeURL, DownloadVideo, GetDownloadPath, GetActualDownloadPath, GetDownloadDirectory, SetDownloadDirectory, SelectDownloadDirectory, GetSettings, GetYtDlpVersion, GetLatestYtDlpVersion, UpdateYtDlp, ValidateCookiesFile, CancelDownload, OpenInExplorer, ConvertVideo, AnalyzePlaylist, GetPlaylistItems, DownloadPlaylist } from '../../wailsjs/go/main/App';


// Типы для событий
export type SetupEventHandlers = {
  'setup-started': () => void;
  'setup-progress': (data: { downloaded: number; total: number; percentage: number } | number) => void;
  'setup-complete': () => void;
  'setup-error': (error: string) => void;
  'ffmpeg-warning': (warning: string) => void;
};

export type DownloadEventHandlers = {
  'download-progress': (data: { progress: number; size: string; speed: string; eta: string } | number) => void;
  'download-complete': () => void;
  'download-error': (error: string) => void;
  'download-cancelled': () => void;
};

export type ConversionEventHandlers = {
  'conversion-progress': (data: { progress: number } | number) => void;
  'conversion-complete': (data: { targetPath: string }) => void;
  'conversion-error': (error: string) => void;
  'conversion-cancelled': () => void;
};

export type YtDlpUpdateEventHandlers = {
  'yt-dlp-update-start': () => void;
  'yt-dlp-update-progress': (data: { downloaded: number; total: number; percentage: number } | number) => void;
  'yt-dlp-update-complete': () => void;
  'yt-dlp-update-error': (error: string) => void;
};

export type AppEventHandlers = SetupEventHandlers & DownloadEventHandlers & ConversionEventHandlers & YtDlpUpdateEventHandlers;

// Функции API
export const apiService = {
  // Функции для анализа URL
  analyzeURL: async (url: string): Promise<string> => {
    return await AnalyzeURL(url);
  },

  // Функции для анализа плейлиста
  analyzePlaylist: async (url: string): Promise<string> => {
    return await AnalyzePlaylist(url);
  },

  // Функции для получения элементов плейлиста
  getPlaylistItems: async (url: string): Promise<string> => {
    return await GetPlaylistItems(url);
  },

  // Функции для загрузки видео
  downloadVideo: async (url: string, formatID: string, outputPath: string): Promise<void> => {
    return await DownloadVideo(url, formatID, outputPath);
  },

  // Функции для загрузки плейлиста
  downloadPlaylist: async (url: string, formatID: string, outputPath: string, startItem: number, endItem: number): Promise<void> => {
    return await DownloadPlaylist(url, formatID, outputPath, startItem, endItem);
  },

  // Отмена загрузки
  cancelDownload: async (): Promise<void> => {
    return await CancelDownload();
  },

  // Получение пути для загрузки
  getDownloadPath: async (title: string): Promise<string> => {
    return await GetDownloadPath(title);
  },

  // Получение актуального пути к загруженному файлу (с реальным расширением)
  getActualDownloadPath: async (title: string): Promise<string> => {
    return await GetActualDownloadPath(title);
  },

  // Получение текущей директории загрузки
  getDownloadDirectory: async (): Promise<string> => {
    return await GetDownloadDirectory();
  },

  // Установка директории загрузки
  setDownloadDirectory: async (path: string): Promise<void> => {
    return await SetDownloadDirectory(path);
  },

  // Выбор директории загрузки через диалог
  selectDownloadDirectory: async (): Promise<string> => {
    return await SelectDownloadDirectory();
  },

  // Работа с настройками
  getSettings: async (): Promise<string> => {
    return await GetSettings();
  },

  // Валидация файла с куками
  validateCookiesFile: async (filePath: string): Promise<[boolean, string]> => {
    try {
      const isValid = await ValidateCookiesFile(filePath);
      return [isValid, ''];
    } catch (error) {
      return [false, error instanceof Error ? error.message : 'Unknown error'];
    }
  },

  // Работа с версиями yt-dlp
  getYtDlpVersion: async (): Promise<string> => {
    return await GetYtDlpVersion();
  },

  getLatestYtDlpVersion: async (): Promise<string> => {
    return await GetLatestYtDlpVersion();
  },

  updateYtDlp: async (): Promise<void> => {
    return await UpdateYtDlp();
  },

  // Открытие в проводнике
  openInExplorer: async (path: string): Promise<void> => {
    return await OpenInExplorer(path);
  },

  // Конвертация видео
  convertVideo: async (sourcePath: string, targetFormat: string): Promise<void> => {
    return await ConvertVideo(sourcePath, targetFormat);
  },

  // Работа с версиями приложения
  getCurrentVersion: async (): Promise<string> => {
    try {
      // @ts-ignore - временное игнорирование для wails bindings
      const result = await window.go.main.App.GetCurrentVersion();
      return result as string;
    } catch {
      return 'dev';
    }
  },

  getLatestVersion: async (): Promise<string> => {
    try {
      // @ts-ignore
      const result = await window.go.main.App.GetLatestVersion();
      return result as string;
    } catch {
      return '';
    }
  },

  checkForUpdate: async (): Promise<string> => {
    try {
      // @ts-ignore
      const result = await window.go.main.App.CheckForUpdate();
      return result as string;
    } catch {
      return '';
    }
  },

  shouldUpdate: async (): Promise<[boolean, string]> => {
    try {
      // @ts-ignore
      const result = await window.go.main.App.ShouldUpdate();
      return result as [boolean, string];
    } catch {
      return [false, ''];
    }
  },

  getUpdateDownloadUrl: async (): Promise<string> => {
    try {
      // @ts-ignore
      const result = await window.go.main.App.GetUpdateDownloadUrl();
      return result as string;
    } catch {
      return '';
    }
  },

  getReleaseNotes: async (): Promise<string> => {
    try {
      // @ts-ignore
      const result = await window.go.main.App.GetReleaseNotes();
      return result as string;
    } catch {
      return '';
    }
  },

  // Обновление настройки использования JS runtime
  updateJSRuntimeSetting: async (useJSRuntime: boolean): Promise<void> => {
    try {
      // @ts-ignore
      await window.go.main.App.UpdateJSRuntimeSetting(useJSRuntime);
    } catch (error) {
      console.error('Failed to update JS runtime setting:', error);
      throw error;
    }
  }
};

// Функция подписки на события
export function subscribeToEvents<K extends keyof AppEventHandlers>(
  eventName: K,
  handler: AppEventHandlers[K]
): () => void {
  // EventsOn уже возвращает функцию отписки
  return EventsOn(eventName, handler as (...args: unknown[]) => void);
}
