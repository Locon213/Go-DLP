// frontend/src/types/wails.d.ts
declare module '../wailsjs/runtime/runtime' {
  export function EventsOn<T = any>(eventName: string, handler: (data: T) => void): void;
}

declare module '../../wailsjs/runtime/runtime' {
  export function EventsOn<T = any>(eventName: string, handler: (data: T) => void): void;
  export function SelectFile(options: any): Promise<string>;
}

declare module '../wailsjs/go/main/App' {
  export function AnalyzeURL(url: string): Promise<string>;
  export function DownloadVideo(url: string, formatID: string, outputPath: string): Promise<void>;
  export function GetDownloadPath(title: string): Promise<string>;
  export function GetSettings(): Promise<string>;
  export function ValidateCookiesFile(filePath: string): Promise<boolean>;
  export function GetYtDlpVersion(): Promise<string>;
  export function GetLatestYtDlpVersion(): Promise<string>;
  export function UpdateYtDlp(): Promise<void>;
  export function UpdateSettingsWithCookiesFile(
    proxyMode: string,
    proxyAddress: string,
    cookiesMode: string,
    cookiesBrowser: string,
    cookiesFile: string
  ): Promise<void>;
}

declare module '../../wailsjs/go/main/App' {
  export function AnalyzeURL(url: string): Promise<string>;
  export function DownloadVideo(url: string, formatID: string, outputPath: string): Promise<void>;
  export function GetDownloadPath(title: string): Promise<string>;
  export function GetSettings(): Promise<string>;
  export function ValidateCookiesFile(filePath: string): Promise<boolean>;
  export function GetYtDlpVersion(): Promise<string>;
  export function GetLatestYtDlpVersion(): Promise<string>;
  export function UpdateYtDlp(): Promise<void>;
  export function UpdateSettingsWithCookiesFile(
    proxyMode: string,
    proxyAddress: string,
    cookiesMode: string,
    cookiesBrowser: string,
    cookiesFile: string
  ): Promise<void>;
}