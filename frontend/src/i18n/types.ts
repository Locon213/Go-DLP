// Типы для системы переводов Go-DLP

export type LanguageCode = 'ru' | 'uk' | 'zh' | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'ko' | 'ar';

// Для обратной совместимости
export type Language = LanguageCode;

export interface Translations {
  // Общие
  appName: string;
  appSubtitle: string;
  loading: string;
  cancel: string;
  save: string;
  close: string;
  back: string;
  next: string;
  done: string;
  error: string;
  success: string;
  warning: string;
  info: string;

  // Главный экран
  enterUrl: string;
  urlPlaceholder: string;
  analyze: string;
  analyzeAndDownload: string;
  analyzing: string;
  downloadMedia: string;
  featuresLightningFast: string;
  featuresSecurePrivate: string;
  featuresHighQuality: string;
  featuresLightningFastDesc: string;
  featuresSecurePrivateDesc: string;
  featuresHighQualityDesc: string;
  supportedPlatforms: string;

  // Экран выбора формата
  selectFormat: string;
  format: string;
  resolution: string;
  size: string;
  download: string;
  duration: string;
  uploader: string;
  views: string;
  noFormats: string;

  // Экран загрузки
  downloading: string;
  downloadProgress: string;
  timeLeft: string;
  speed: string;
  fileSize: string;
  cancelDownload: string;

  // Экран завершения загрузки
  downloadComplete: string;
  savedTo: string;
  openInExplorer: string;
  thankYou: string;
  thankYouMessage: string;
  goToHome: string;
  convertVideo: string;
  selectTargetFormat: string;
  converting: string;
  convertProgress: string;

  // Настройки
  settings: string;
  proxy: string;
  proxyMode: string;
  proxyAddress: string;
  cookies: string;
  cookiesMode: string;
  cookiesBrowser: string;
  cookiesFile: string;
  selectFile: string;
  version: string;
  currentVersion: string;
  latestVersion: string;
  checkUpdate: string;
  update: string;
  updating: string;

  // Обновление приложения
  appUpdate: string;
  updateAvailable: string;
  updateNotAvailable: string;
  newVersionAvailable: string;
  newVersion: string;
  downloadUpdate: string;
  releaseNotes: string;
  aboutApp: string;
  aboutAppDescription: string;
  checkingForUpdates: string;
  appUpdateCheck: string;
  unknown: string;

  // Уведомления
  downloadCompleted: string;
  downloadFailed: string;
  downloadCancelled: string;
  settingsSaved: string;
  settingsLoadFailed: string;
  versionCheckFailed: string;
  updateFailed: string;
  updateSuccess: string;
  invalidUrl: string;
  analysisFailed: string;
  noFormatFound: string;
  conversionFailed: string;
  conversionSuccess: string;

  // Перекодирование
  convertTitle: string;
  convertDescription: string;
  sourceFile: string;
  targetFormat: string;
  convertButton: string;
  convertingVideo: string;
  conversionComplete: string;
  conversionError: string;

  // Темы
  toggleTheme: string;
  darkMode: string;
  lightMode: string;

  // Setup
  settingUpComponents: string;
  percentComplete: string;

  // Экран выбора пути сохранения
  selectSaveLocation: string;
  saveLocationDescription: string;
  videoTitle: string;
  currentSaveLocation: string;
  selectFolder: string;
  selecting: string;
  orEnterCustomPath: string;
  useThisPath: string;
  startDownload: string;

  // Настройки прокси
  noProxy: string;
  useSystemProxy: string;
  manualProxy: string;

  // Настройки куки
  noCookies: string;
  extractFromBrowser: string;
  useCookieFile: string;
  selectBrowser: string;
  clickFolderIcon: string;

  // Плейлист
  playlistVideosCount: string;
  selectAll: string;
  deselectAll: string;
  selected: string;
  videoIndex: string;
  unknownDuration: string;
  downloadSelected: string;

  // Очередь загрузок
  downloadQueue: string;
  queueDescription: string;
  pending: string;
  inProgress: string;
  completed: string;
  noDownloadsInQueue: string;
  currentDownloads: string;
  pendingDownloads: string;
  completedDownloads: string;
  waitingToDownload: string;
  completedSuccessfully: string;
  failed: string;
  cancelled: string;

  // История загрузок
  downloadHistory: string;
  historyDescription: string;
  noHistory: string;
  clearHistory: string;

  // Настройки очереди
  autoRedirectToQueue: string;
  autoRedirectToQueueDescription: string;

  // UpdateProgressModal
  updatingYtDlp: string;

  // SettingsModal - Deno
  denoStatus: string;
  denoInstalled: string;
  denoNotInstalled: string;
  denoUpdateAvailable: string;
  denoInstall: string;
  denoInstalling: string;
  denoInstallingDeno: string;
  denoChecking: string;
  denoCheckUpdate: string;
  denoExtracting: string;
  denoDownloading: string;
  denoDownloadStatus: string;
  denoInstallComplete: string;
  denoError: string;

  // SettingsModal - Queue buttons
  clearQueue: string;
  clearCache: string;

  // SettingsModal - Proxy options
  noProxyOption: string;
  useSystemProxyOption: string;
  manualProxyOption: string;

  // SettingsModal - Cookies options
  noCookiesOption: string;
  extractFromBrowserOption: string;
  useCookieFileOption: string;
  selectBrowserLabel: string;
  clickFolderIconForCookieFile: string;

  // SettingsModal - JS Runtime
  useJavaScriptRuntime: string;
  useJavaScriptRuntimeDescription: string;
  denoStatusSection: string;

  // SettingsModal - yt-dlp version
  ytDlpVersion: string;
  ytDlpCurrentVersion: string;
  ytDlpLatestVersion: string;
  ytDlpUpdateAvailable: string;

  // SettingsModal - App version
  appVersionSection: string;
  appCurrentVersion: string;
  appLatestVersion: string;
  appUpdateAvailableMessage: string;

  // SelectionScreen - Filters
  filterAll: string;
  filterVideoAudio: string;
  filterVideo: string;
  filterAudio: string;
  sortQuality: string;
  sortSize: string;
  selectBestQuality: string;
  noFormatsMatchFilter: string;
  recommended: string;
  selectedFormat: string;
  noVideo: string;
  noAudio: string;

  // App.tsx - Tooltips
  switchToLightMode: string;
  switchToDarkMode: string;
  downloadQueueTooltip: string;
  downloadHistoryTooltip: string;
  settingsTooltip: string;

  // PlaylistScreen
  playlistTitle: string;
  playlistDescription: string;

  // QueueScreen
  queueTitle: string;
  queueDescriptionText: string;
  calculating: string;

  // HistoryScreen
  historyTitle: string;
  historyDescriptionText: string;

  // CompletionScreen
  completionVideoTitle: string;
  completionUploader: string;

  // DownloadScreen
  downloadScreenTitle: string;
  downloadScreenUploader: string;

  // ConversionScreen
  conversionScreenTitle: string;
  conversionScreenDescription: string;
  conversionScreenSourceFile: string;

  // SavePathScreen
  savePathScreenTitle: string;
  savePathScreenDescription: string;
  savePathScreenVideoTitle: string;
  savePathScreenCurrentSaveLocation: string;
  savePathScreenOrEnterCustomPath: string;
  savePathScreenUseThisPath: string;
  savePathScreenStartDownload: string;

  // InputScreen
  pasteFromClipboard: string;
}

// Частичные переводы - любой ключ может отсутствовать
export type PartialTranslations = Partial<Translations>;
