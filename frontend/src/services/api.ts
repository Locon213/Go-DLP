// РЎРµСЂРІРёСЃ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ API Wails

import { EventsOn } from '../../wailsjs/runtime/runtime';
import { AnalyzeURL, DownloadVideo, GetDownloadPath, GetActualDownloadPath, GetDownloadDirectory, SetDownloadDirectory, SelectDownloadDirectory, GetSettings, GetYtDlpVersion, GetLatestYtDlpVersion, UpdateYtDlp, ValidateCookiesFile, CancelDownload, OpenInExplorer, ConvertVideo, AnalyzePlaylist, GetPlaylistItems, DownloadPlaylist, GetClipboardText, ReadLinksFromFile, ProcessDroppedFiles, SelectTextFile } from '../../wailsjs/go/main/App';


// РўРёРїС‹ РґР»СЏ СЃРѕР±С‹С‚РёР№
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
  'download-cancelled': (data?: { reason?: string }) => void;
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

// Р¤СѓРЅРєС†РёРё API
export const apiService = {
  // Р¤СѓРЅРєС†РёРё РґР»СЏ Р°РЅР°Р»РёР·Р° URL
  analyzeURL: async (url: string): Promise<string> => {
    return await AnalyzeURL(url);
  },

  // Р¤СѓРЅРєС†РёРё РґР»СЏ Р°РЅР°Р»РёР·Р° РїР»РµР№Р»РёСЃС‚Р°
  analyzePlaylist: async (url: string): Promise<string> => {
    return await AnalyzePlaylist(url);
  },

  // Р¤СѓРЅРєС†РёРё РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ СЌР»РµРјРµРЅС‚РѕРІ РїР»РµР№Р»РёСЃС‚Р°
  getPlaylistItems: async (url: string): Promise<string> => {
    return await GetPlaylistItems(url);
  },

  // Р¤СѓРЅРєС†РёРё РґР»СЏ Р·Р°РіСЂСѓР·РєРё РІРёРґРµРѕ
  downloadVideo: async (url: string, formatID: string, outputPath: string): Promise<void> => {
    return await DownloadVideo(url, formatID, outputPath);
  },

  // Р¤СѓРЅРєС†РёРё РґР»СЏ Р·Р°РіСЂСѓР·РєРё РїР»РµР№Р»РёСЃС‚Р°
  downloadPlaylist: async (url: string, formatID: string, outputPath: string, startItem: number, endItem: number): Promise<void> => {
    return await DownloadPlaylist(url, formatID, outputPath, startItem, endItem);
  },

  // РћС‚РјРµРЅР° Р·Р°РіСЂСѓР·РєРё
  cancelDownload: async (): Promise<void> => {
    return await CancelDownload();
  },

  pauseDownload: async (): Promise<void> => {
    // @ts-ignore - method is available after backend regeneration
    return await window.go.main.App.PauseDownload();
  },

  // РџРѕР»СѓС‡РµРЅРёРµ РїСѓС‚Рё РґР»СЏ Р·Р°РіСЂСѓР·РєРё
  getDownloadPath: async (title: string): Promise<string> => {
    return await GetDownloadPath(title);
  },

  // РџРѕР»СѓС‡РµРЅРёРµ Р°РєС‚СѓР°Р»СЊРЅРѕРіРѕ РїСѓС‚Рё Рє Р·Р°РіСЂСѓР¶РµРЅРЅРѕРјСѓ С„Р°Р№Р»Сѓ (СЃ СЂРµР°Р»СЊРЅС‹Рј СЂР°СЃС€РёСЂРµРЅРёРµРј)
  getActualDownloadPath: async (title: string): Promise<string> => {
    return await GetActualDownloadPath(title);
  },

  // РџРѕР»СѓС‡РµРЅРёРµ С‚РµРєСѓС‰РµР№ РґРёСЂРµРєС‚РѕСЂРёРё Р·Р°РіСЂСѓР·РєРё
  getDownloadDirectory: async (): Promise<string> => {
    return await GetDownloadDirectory();
  },

  // РЈСЃС‚Р°РЅРѕРІРєР° РґРёСЂРµРєС‚РѕСЂРёРё Р·Р°РіСЂСѓР·РєРё
  setDownloadDirectory: async (path: string): Promise<void> => {
    return await SetDownloadDirectory(path);
  },

  // Р’С‹Р±РѕСЂ РґРёСЂРµРєС‚РѕСЂРёРё Р·Р°РіСЂСѓР·РєРё С‡РµСЂРµР· РґРёР°Р»РѕРі
  selectDownloadDirectory: async (): Promise<string> => {
    return await SelectDownloadDirectory();
  },

  // Р Р°Р±РѕС‚Р° СЃ РЅР°СЃС‚СЂРѕР№РєР°РјРё
  getSettings: async (): Promise<string> => {
    return await GetSettings();
  },

  // Р’Р°Р»РёРґР°С†РёСЏ С„Р°Р№Р»Р° СЃ РєСѓРєР°РјРё
  validateCookiesFile: async (filePath: string): Promise<[boolean, string]> => {
    try {
      const isValid = await ValidateCookiesFile(filePath);
      return [isValid, ''];
    } catch (error) {
      return [false, error instanceof Error ? error.message : 'Unknown error'];
    }
  },

  // Р Р°Р±РѕС‚Р° СЃ РІРµСЂСЃРёСЏРјРё yt-dlp
  getYtDlpVersion: async (): Promise<string> => {
    return await GetYtDlpVersion();
  },

  getLatestYtDlpVersion: async (): Promise<string> => {
    return await GetLatestYtDlpVersion();
  },

  updateYtDlp: async (): Promise<void> => {
    return await UpdateYtDlp();
  },

  // РћС‚РєСЂС‹С‚РёРµ РІ РїСЂРѕРІРѕРґРЅРёРєРµ
  openInExplorer: async (path: string): Promise<void> => {
    return await OpenInExplorer(path);
  },

  // РљРѕРЅРІРµСЂС‚Р°С†РёСЏ РІРёРґРµРѕ
  convertVideo: async (sourcePath: string, targetFormat: string): Promise<void> => {
    return await ConvertVideo(sourcePath, targetFormat);
  },

  // Р Р°Р±РѕС‚Р° СЃ РІРµСЂСЃРёСЏРјРё РїСЂРёР»РѕР¶РµРЅРёСЏ
  getCurrentVersion: async (): Promise<string> => {
    try {
      // @ts-ignore - РІСЂРµРјРµРЅРЅРѕРµ РёРіРЅРѕСЂРёСЂРѕРІР°РЅРёРµ РґР»СЏ wails bindings
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

  // РћР±РЅРѕРІР»РµРЅРёРµ РЅР°СЃС‚СЂРѕР№РєРё РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ JS runtime
  updateJSRuntimeSetting: async (useJSRuntime: boolean): Promise<void> => {
    try {
      // @ts-ignore
      await window.go.main.App.UpdateJSRuntimeSetting(useJSRuntime);
    } catch (error) {
      console.error('Failed to update JS runtime setting:', error);
      throw error;
    }
  },

  // Р Р°Р±РѕС‚Р° СЃ Р±СѓС„РµСЂРѕРј РѕР±РјРµРЅР°
  getClipboardText: async (): Promise<string> => {
    return await GetClipboardText();
  },

  // Р§С‚РµРЅРёРµ СЃСЃС‹Р»РѕРє РёР· С„Р°Р№Р»Р°
  readLinksFromFile: async (filePath: string): Promise<string[]> => {
    const result = await ReadLinksFromFile(filePath);
    return JSON.parse(result);
  },

  // РћР±СЂР°Р±РѕС‚РєР° РїРµСЂРµС‚Р°СЃРєРёРІР°РµРјС‹С… С„Р°Р№Р»РѕРІ
  processDroppedFiles: async (filePaths: string[]): Promise<Array<{type: string; value: string}>> => {
    const result = await ProcessDroppedFiles(filePaths);
    return JSON.parse(result);
  },

  // Р’С‹Р±РѕСЂ TXT С„Р°Р№Р»Р°
  selectTextFile: async (): Promise<string> => {
    return await SelectTextFile();
  }
};

// Р¤СѓРЅРєС†РёСЏ РїРѕРґРїРёСЃРєРё РЅР° СЃРѕР±С‹С‚РёСЏ
export function subscribeToEvents<K extends keyof AppEventHandlers>(
  eventName: K,
  handler: AppEventHandlers[K]
): () => void {
  // EventsOn СѓР¶Рµ РІРѕР·РІСЂР°С‰Р°РµС‚ С„СѓРЅРєС†РёСЋ РѕС‚РїРёСЃРєРё
  return EventsOn(eventName, handler as (...args: unknown[]) => void);
}

