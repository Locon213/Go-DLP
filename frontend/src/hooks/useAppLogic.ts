// Хук для логики приложения

import { useState, useEffect, useCallback } from 'react';
import { apiService, subscribeToEvents } from '../services/api';
import { UpdateSettingsWithCookiesFile, GetSettings as GetSettingsAPI, UpdateAutoRedirectToQueue } from '../../wailsjs/go/main/App';
import { VideoInfo } from '../types';
import { downloadQueueManager, QueueItem } from '../services/downloadQueue';
import { downloadHistoryDB, DownloadHistoryItem } from '../services/downloadHistory';
import { pendingDownloadsManager } from '../services/pendingDownloads';

interface PlaylistEntry {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  duration: number;
}

export const useAppLogic = () => {
  // Состояния для основного приложения
  const [url, setUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [setupProgress, setSetupProgress] = useState<number>(0);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSize, setDownloadSize] = useState<string>('Calculating...');
  const [downloadSpeed, setDownloadSpeed] = useState<string>('Calculating...');
  const [downloadEta, setDownloadEta] = useState<string>('Calculating...');
  const [currentStep, setCurrentStep] = useState<'setup' | 'input' | 'analysis' | 'selection' | 'playlist' | 'savepath' | 'download' | 'completion' | 'conversion' | 'settings' | 'queue' | 'history'>('setup');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [playlistInfo, setPlaylistInfo] = useState<any>(null); // Will store playlist info
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]); // IDs of selected videos in playlist
  const [playlistVideoFlowIds, setPlaylistVideoFlowIds] = useState<string[]>([]);
  const [playlistCurrentVideoIndex, setPlaylistCurrentVideoIndex] = useState<number>(0);
  const [playlistSelectedFormats, setPlaylistSelectedFormats] = useState<Record<string, string>>({});
  const [playlistVideoInfoCache, setPlaylistVideoInfoCache] = useState<Record<string, VideoInfo>>({});
  const [isPlaylistVideoFlowActive, setIsPlaylistVideoFlowActive] = useState<boolean>(false);
  const [ffmpegWarning, setFfmpegWarning] = useState<string>('');

  // Состояния для настроек
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [proxyMode, setProxyMode] = useState<'none' | 'system' | 'manual'>('none');
  const [proxyAddress, setProxyAddress] = useState<string>('');
  const [cookiesMode, setCookiesMode] = useState<'none' | 'browser' | 'file'>('none');
  const [cookiesBrowser, setCookiesBrowser] = useState<'chrome' | 'firefox' | 'opera' | 'edge'>('chrome');
  const [cookiesFile, setCookiesFile] = useState<string>('');
  const [autoRedirectToQueue, setAutoRedirectToQueue] = useState<boolean>(true);
  const [useJSRuntime, setUseJSRuntime] = useState<boolean>(false);
  const [jsRuntimeType, setJsRuntimeType] = useState<'deno' | 'node'>('deno');

  // Состояния для версии yt-dlp
  const [currentYtDlpVersion, setCurrentYtDlpVersion] = useState<string>('');
  const [latestYtDlpVersion, setLatestYtDlpVersion] = useState<string>('');
  const [isCheckingVersion, setIsCheckingVersion] = useState<boolean>(false);
  const [isUpdatingYtDlp, setIsUpdatingYtDlp] = useState<boolean>(false);

  // Состояния для модального окна обновления yt-dlp
  const [showUpdateProgress, setShowUpdateProgress] = useState<boolean>(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [updateStatus, setUpdateStatus] = useState<string>('');

  // Состояния для обновления приложения
  const [showAppUpdateModal, setShowAppUpdateModal] = useState<boolean>(false);
  const [currentAppVersion, setCurrentAppVersion] = useState<string>('');
  const [latestAppVersion, setLatestAppVersion] = useState<string>('');
  const [releaseNotes, setReleaseNotes] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isCheckingAppVersion, setIsCheckingAppVersion] = useState<boolean>(false);

  // Состояние для пути загрузки
  const [downloadPath, setDownloadPath] = useState<string>('');

  // Состояния для очереди загрузок
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  // Состояния для истории загрузок
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);

  // Состояние для уведомлений
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Обработчики событий
  useEffect(() => {
    // Подписываемся на события от Go
    const unsubscribes = [
      subscribeToEvents('setup-started', () => {
        setCurrentStep('setup');
      }),

      subscribeToEvents('setup-progress', (data: any) => {
        const percentage = typeof data === 'object' ? data.percentage : data;
        setSetupProgress(Number(percentage));
      }),

      subscribeToEvents('setup-complete', () => {
        setTimeout(() => {
          setCurrentStep('input');
        }, 100);
      }),

      subscribeToEvents('setup-error', (error: string) => {
        showError(`Setup Error: ${error}`);
        setCurrentStep('input');
      }),

      subscribeToEvents('ffmpeg-warning', (warning: string) => {
        setFfmpegWarning(warning);
        console.warn(warning);
      }),

      subscribeToEvents('download-progress', (data: any) => {
        if (typeof data === 'object') {
          const newProgress = Number(data.progress || 0);
          // [FIX] Убраны проверки if (data.size), теперь обновляем всегда, используя fallback
          const newSize = data.size || 'Calculating...';
          const newSpeed = data.speed || 'Calculating...';
          const newEta = data.eta || 'Calculating...';

          setDownloadProgress(newProgress);
          setDownloadSize(newSize);
          setDownloadSpeed(newSpeed);
          setDownloadEta(newEta);

          // Обновляем прогресс в очереди загрузок
          const activeDownloads = downloadQueueManager.getActiveDownloads();
          if (activeDownloads.length > 0) {
            const activeItem = activeDownloads[0];
            // [FIX] Передаем значения без undefined
            downloadQueueManager.updateProgress(
              activeItem.id,
              newProgress,
              newSpeed,
              newSize,
              newEta
            );
          }
        } else {
          setDownloadProgress(Number(data));
        }
      }),

      subscribeToEvents('download-complete', async () => {
        const isDirectDownload = currentStep === 'download' || isDownloading;
        const cancelingId = downloadQueueManager.getCancelingId();
        const activeDownloads = downloadQueueManager.getActiveDownloads();
        const activeQueueItem = cancelingId
          ? downloadQueueManager.getById(cancelingId)
          : (activeDownloads.length > 0 ? activeDownloads[0] : undefined);

        setIsDownloading(false);
        setDownloadSize('Complete');
        setDownloadSpeed('0');
        setDownloadEta('00:00');

        if (!isDirectDownload && activeQueueItem) {
          downloadQueueManager.setStatus(activeQueueItem.id, 'completed');
          downloadQueueManager.clearCancelingId();

          try {
            let completedOutputPath = activeQueueItem.outputPath;
            try {
              completedOutputPath = await apiService.getActualDownloadPath(activeQueueItem.title);
            } catch (pathError) {
              console.warn('Failed to resolve actual path for queue item, using template path:', pathError);
            }

            await downloadHistoryDB.addItem({
              url: activeQueueItem.url,
              title: activeQueueItem.title,
              formatID: activeQueueItem.formatID,
              outputPath: completedOutputPath,
              status: 'completed',
              fileSize: undefined,
              duration: undefined,
              downloadedAt: new Date(),
              thumbnail: undefined,
            });

            const history = await downloadHistoryDB.getAllItems();
            setDownloadHistory(history);
          } catch (dbError) {
            console.error('Failed to add completed download to history:', dbError);
          }

          return;
        }
        if (!isDirectDownload && !activeQueueItem) {
          downloadQueueManager.clearCancelingId();
          return;
        }

        // Дополнительная проверка перед показом экрана завершения
        if (videoInfo) {
          try {
            const actualPath = await apiService.getActualDownloadPath(videoInfo.title);

            // Проверяем, существует ли файл и достаточно ли он большой
            if (actualPath && actualPath !== '') {
              // Проверяем, не является ли путь ошибкой
              if (actualPath.includes('download incomplete') || actualPath.includes('temporary files')) {
                console.warn('Download appears to be incomplete, not showing completion screen');
                // Показываем ошибку вместо экрана завершения
                showError('Download appears to be incomplete. Please check the download status.');
                setCurrentStep('selection');
                return;
              }

              setDownloadPath(actualPath);

              // Удаляем из очереди вместо установки статуса completed
              const activeDownloads = downloadQueueManager.getActiveDownloads();
              if (activeDownloads.length > 0) {
                const activeItem = activeDownloads[0];
                downloadQueueManager.setStatus(activeItem.id, 'completed');
              }

              // Очищаем pending downloads из localStorage только для прямой загрузки
              pendingDownloadsManager.clearPendingDownloads();

              // Добавляем в историю загрузок
              await downloadHistoryDB.addItem({
                url: url,
                title: videoInfo.title,
                formatID: selectedFormat,
                outputPath: actualPath,
                status: 'completed',
                fileSize: undefined, // yt-dlp не предоставляет размер файла в событии
                duration: videoInfo.duration,
                downloadedAt: new Date(), // Указываем время завершения загрузки
                thumbnail: videoInfo.thumbnail,
              });

              // Обновляем историю
              const history = await downloadHistoryDB.getAllItems();
              setDownloadHistory(history);

              // Только если все проверки пройдены, показываем экран завершения
              setCurrentStep('completion');
              showSuccess('Download completed!');
            } else {
              console.warn('No valid download path returned, treating as incomplete');
              showError('Download failed: No file path returned');
              setCurrentStep('selection');
            }
          } catch (error) {
            console.error('Failed to get actual download path:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Если ошибка связана с незавершенной загрузкой, показываем соответствующее сообщение
            if (errorMessage.includes('incomplete') || errorMessage.includes('temporary')) {
              showError(`Download appears to be incomplete: ${errorMessage}`);
            } else {
              showError(`Failed to verify download: ${errorMessage}`);
            }
            setCurrentStep('selection');
          }
        } else {
          console.error('No video info available for download completion');
          showError('Download completed but no video information available');
          setCurrentStep('input');
        }
      }),

      subscribeToEvents('download-error', async (error: string) => {
        const isDirectDownload = currentStep === 'download' || isDownloading;
        const cancelingId = downloadQueueManager.getCancelingId();
        const activeDownloads = downloadQueueManager.getActiveDownloads();
        const activeQueueItem = cancelingId
          ? downloadQueueManager.getById(cancelingId)
          : (activeDownloads.length > 0 ? activeDownloads[0] : undefined);

        setIsDownloading(false);
        setDownloadSize('Error');
        setDownloadSpeed('0');
        setDownloadEta('00:00');

        if (!isDirectDownload && activeQueueItem) {
          downloadQueueManager.setStatus(activeQueueItem.id, 'failed');
          downloadQueueManager.clearCancelingId();

          try {
            await downloadHistoryDB.addItem({
              url: activeQueueItem.url,
              title: activeQueueItem.title,
              formatID: activeQueueItem.formatID,
              outputPath: activeQueueItem.outputPath,
              status: 'failed',
              fileSize: undefined,
              duration: undefined,
              downloadedAt: new Date(),
              thumbnail: undefined,
            });

            const history = await downloadHistoryDB.getAllItems();
            setDownloadHistory(history);
          } catch (dbError) {
            console.error('Failed to add failed download to history:', dbError);
          }

          return;
        }
        if (!isDirectDownload && !activeQueueItem) {
          downloadQueueManager.clearCancelingId();
          return;
        }

        // Удаляем из очереди вместо установки статуса failed
        if (activeDownloads.length > 0) {
          const activeItem = activeDownloads[0];
          downloadQueueManager.setStatus(activeItem.id, 'failed');
        }

        // Очищаем pending downloads из localStorage
        pendingDownloadsManager.clearPendingDownloads();

        // Добавляем в историю как неудачную загрузку
        if (videoInfo) {
          try {
            await downloadHistoryDB.addItem({
              url: url,
              title: videoInfo.title,
              formatID: selectedFormat,
              outputPath: '',
              status: 'failed',
              fileSize: undefined,
              duration: videoInfo.duration,
              downloadedAt: new Date(), // Указываем время завершения загрузки
              thumbnail: videoInfo.thumbnail,
            });

            // Обновляем историю
            const history = await downloadHistoryDB.getAllItems();
            setDownloadHistory(history);
          } catch (dbError) {
            console.error('Failed to add failed download to history:', dbError);
          }
        }

        // Сбрасываем состояние видео и переходим на выбор формата
        setVideoInfo(null);
        setSelectedFormat('');
        setCurrentStep('selection');
        showError(`Download Error: ${error}`);
      }),

      subscribeToEvents('download-cancelled', async () => {
        const isDirectDownload = currentStep === 'download' || isDownloading;
        const cancelingId = downloadQueueManager.getCancelingId();
        const activeDownloads = downloadQueueManager.getActiveDownloads();
        const activeQueueItem = cancelingId
          ? downloadQueueManager.getById(cancelingId)
          : (activeDownloads.length > 0 ? activeDownloads[0] : undefined);

        setIsDownloading(false);
        setDownloadSize('Cancelled');
        setDownloadSpeed('0');
        setDownloadEta('00:00');

        if (!isDirectDownload && activeQueueItem) {
          downloadQueueManager.setStatus(activeQueueItem.id, 'cancelled');
          downloadQueueManager.clearCancelingId();

          try {
            await downloadHistoryDB.addItem({
              url: activeQueueItem.url,
              title: activeQueueItem.title,
              formatID: activeQueueItem.formatID,
              outputPath: activeQueueItem.outputPath,
              status: 'cancelled',
              fileSize: undefined,
              duration: undefined,
              downloadedAt: new Date(),
              thumbnail: undefined,
            });

            const history = await downloadHistoryDB.getAllItems();
            setDownloadHistory(history);
          } catch (dbError) {
            console.error('Failed to add cancelled download to history:', dbError);
          }

          return;
        }
        if (!isDirectDownload && !activeQueueItem) {
          downloadQueueManager.clearCancelingId();
          return;
        }

        // Обновляем статус в очереди загрузок
        if (activeDownloads.length > 0) {
          const activeItem = activeDownloads[0];
          downloadQueueManager.setStatus(activeItem.id, 'cancelled');
        }

        // Очищаем pending downloads из localStorage
        pendingDownloadsManager.clearPendingDownloads();

        // Добавляем в историю как отменённую загрузку
        if (videoInfo) {
          try {
            await downloadHistoryDB.addItem({
              url: url,
              title: videoInfo.title,
              formatID: selectedFormat,
              outputPath: '',
              status: 'cancelled',
              fileSize: undefined,
              duration: videoInfo.duration,
              downloadedAt: new Date(), // Указываем время завершения загрузки
              thumbnail: videoInfo.thumbnail,
            });

            // Обновляем историю
            const history = await downloadHistoryDB.getAllItems();
            setDownloadHistory(history);
          } catch (dbError) {
            console.error('Failed to add cancelled download to history:', dbError);
          }
        }

        // Сбрасываем состояние видео и переходим на главную
        setVideoInfo(null);
        setSelectedFormat('');
        setCurrentStep('input');
      }),

      // Обработчики событий обновления yt-dlp
      subscribeToEvents('yt-dlp-update-start', () => {
        setShowUpdateProgress(true);
        setUpdateProgress(0);
        setUpdateStatus('Загрузка обновления...');
      }),

      subscribeToEvents('yt-dlp-update-progress', (data: any) => {
        if (typeof data === 'object') {
          const percentage = data.percentage || 0;
          setUpdateProgress(percentage);
          const downloaded = data.downloaded || 0;
          const total = data.total || 0;
          const downloadedMB = (downloaded / (1024 * 1024)).toFixed(2);
          const totalMB = (total / (1024 * 1024)).toFixed(2);
          setUpdateStatus(`Загружено ${downloadedMB} MB из ${totalMB} MB (${percentage}%)`);
        }
      }),

      subscribeToEvents('yt-dlp-update-complete', () => {
        setUpdateProgress(100);
        setUpdateStatus('Обновление завершено!');
        setTimeout(() => {
          setShowUpdateProgress(false);
          setIsUpdatingYtDlp(false);
          showSuccess('yt-dlp обновлен успешно!');
        }, 1000);
      }),

      subscribeToEvents('yt-dlp-update-error', (error: string) => {
        setUpdateStatus(`Ошибка: ${error}`);
        setTimeout(() => {
          setShowUpdateProgress(false);
          setIsUpdatingYtDlp(false);
          showError(`Ошибка обновления yt-dlp: ${error}`);
        }, 2000);
      }),

      // Обработчики событий конвертации
      subscribeToEvents('conversion-progress', (data: any) => {
        if (typeof data === 'object' && data.progress !== undefined) {
          // Progress event received from backend
        }
      }),

      subscribeToEvents('conversion-complete', (data: any) => {
        setIsDownloading(false);
        showSuccess('Conversion completed successfully!');
        if (data && data.targetPath) {
          setDownloadPath(data.targetPath);
        }
      }),

      subscribeToEvents('conversion-error', (error: string) => {
        setIsDownloading(false);
        showError(`Conversion Error: ${error}`);
      }),

      subscribeToEvents('conversion-cancelled', () => {
        setIsDownloading(false);
        showError('Conversion cancelled');
      }),

    ];


    // Загружаем историю загрузок при запуске
    const loadHistory = async () => {
      try {
        const history = await downloadHistoryDB.getAllItems();
        setDownloadHistory(history);
      } catch (error) {
        console.error('Failed to load download history:', error);
      }
    };

    loadHistory();

    // Восстанавливаем незавершенные загрузки при запуске
    pendingDownloadsManager.resumePendingDownloads();

    // Обновляем очередь загрузок каждые 2 секунды
    const queueInterval = setInterval(async () => {
      const queueItems = downloadQueueManager.getAll();
      setQueueItems(queueItems);

      // Сохраняем незавершенные загрузки
      pendingDownloadsManager.savePendingDownloads();
    }, 2000);
    
    // Функции для очистки подписок при размонтировании
    return () => {
      clearInterval(queueInterval);
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [url, videoInfo, selectedFormat]);

  // Отдельный эффект для уведомлений
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Функции для работы с уведомлениями
  const showError = (message: string) => {
    setNotification({type: 'error', message});
  };

  const showSuccess = (message: string) => {
    setNotification({type: 'success', message});
  };

  const resolveActualOutputPath = async (path: string): Promise<string> => {
    if (!path || !path.includes('.%(ext)s')) {
      return path;
    }

    const templateName = path.split(/[\\/]/).pop() || '';
    const templateTitle = templateName.replace(/\.%\(ext\)s$/, '');
    if (!templateTitle) {
      return path;
    }

    try {
      return await apiService.getActualDownloadPath(templateTitle);
    } catch (error) {
      console.warn('Failed to resolve template output path, using original:', error);
      return path;
    }
  };

  // Функции для работы с настройками
  const loadSettings = async () => {
    try {
      const settingsJson = await GetSettingsAPI();
      const settings = JSON.parse(settingsJson);

      setProxyMode(settings.proxy_mode);
      setProxyAddress(settings.proxy_address);
      setCookiesMode(settings.cookies_mode);
      setCookiesBrowser(settings.cookies_browser as 'chrome' | 'firefox' | 'opera' | 'edge');
      setCookiesFile(settings.cookies_file || '');
      setAutoRedirectToQueue(settings.auto_redirect_to_queue !== undefined ? settings.auto_redirect_to_queue : true);
      setUseJSRuntime(settings.use_js_runtime !== undefined ? settings.use_js_runtime : false);
      setJsRuntimeType(settings.js_runtime_type || 'deno');
    } catch (error) {
      console.error('Failed to load settings:', error);
      showError('Failed to load settings');
    }
  };

  const saveSettings = async () => {
    try {
      await UpdateSettingsWithCookiesFile(proxyMode, proxyAddress, cookiesMode, cookiesBrowser, cookiesFile);
      await UpdateAutoRedirectToQueue(autoRedirectToQueue);

      // Обновляем настройки JS runtime через отдельные методы
      await apiService.updateJSRuntimeSetting(useJSRuntime);
      
      // Обновляем тип JS runtime
      try {
        // @ts-ignore - wails binding
        await window.go.main.App.UpdateJSRuntimeType(jsRuntimeType);
      } catch (err) {
        console.error('Failed to update JS runtime type:', err);
      }

      showSuccess('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showError('Failed to save settings');
    }
  };

  // Функция для проверки версии yt-dlp
  const checkYtDlpVersion = async () => {
    setIsCheckingVersion(true);
    try {
      const [current, latest] = await Promise.all([
        apiService.getYtDlpVersion(),
        apiService.getLatestYtDlpVersion()
      ]);
      setCurrentYtDlpVersion(current);
      setLatestYtDlpVersion(latest);
      showSuccess('Version check completed!');
    } catch (error) {
      console.error('Failed to check yt-dlp version:', error);
      showError('Failed to check yt-dlp version');
    } finally {
      setIsCheckingVersion(false);
    }
  };

  // Функция для обновления yt-dlp
  const updateYtDlp = async () => {
    setIsUpdatingYtDlp(true);
    setShowUpdateProgress(true);
    setUpdateProgress(0);
    setUpdateStatus('Загрузка обновления...');
    try {
      await apiService.updateYtDlp();
      // После обновления проверяем версию снова
      const current = await apiService.getYtDlpVersion();
      setCurrentYtDlpVersion(current);
      // Модальное окно закроется автоматически при получении события yt-dlp-update-complete
    } catch (error) {
      console.error('Failed to update yt-dlp:', error);
      showError('Failed to update yt-dlp');
      setShowUpdateProgress(false);
      setIsUpdatingYtDlp(false);
    }
  };

  // Функция для проверки версии приложения
  const checkAppVersion = async () => {
    setIsCheckingAppVersion(true);
    try {
      const [current, latest, notes, url] = await Promise.all([
        apiService.getCurrentVersion(),
        apiService.getLatestVersion(),
        apiService.getReleaseNotes(),
        apiService.getUpdateDownloadUrl()
      ]);
      setCurrentAppVersion(current);
      setLatestAppVersion(latest);
      setReleaseNotes(notes);
      setDownloadUrl(url);
      
      if (latest && current && latest !== current) {
        // Если доступна новая версия, показываем модальное окно
        setShowAppUpdateModal(true);
      } else {
        showSuccess('Вы используете последнюю версию приложения!');
      }
    } catch (error) {
      console.error('Failed to check app version:', error);
      showError('Не удалось проверить версию приложения');
    } finally {
      setIsCheckingAppVersion(false);
    }
  };

  // Функция для открытия модального окна обновления приложения
  const openAppUpdateModal = async () => {
    try {
      const [current, latest, notes, url] = await Promise.all([
        apiService.getCurrentVersion(),
        apiService.getLatestVersion(),
        apiService.getReleaseNotes(),
        apiService.getUpdateDownloadUrl()
      ]);
      setCurrentAppVersion(current);
      setLatestAppVersion(latest);
      setReleaseNotes(notes);
      setDownloadUrl(url);
      setShowAppUpdateModal(true);
    } catch (error) {
      console.error('Failed to load app update info:', error);
      showError('Не удалось загрузить информацию об обновлении');
    }
  };

  // Функция для выбора файла с куками
  const selectCookiesFile = async () => {
    try {
      // Use backend method to open file dialog
      const { SelectCookiesFile } = await import('../../wailsjs/go/main/App');
      
      const filePath = await SelectCookiesFile();

      if (filePath) {
        setCookiesFile(filePath);
        showSuccess('Cookies file selected!');
      }
    } catch (error) {
      console.error('Error selecting cookies file:', error);
      showError('Failed to select cookies file');
    }
  };

  const resetPlaylistVideoFlow = useCallback(() => {
    setIsPlaylistVideoFlowActive(false);
    setPlaylistVideoFlowIds([]);
    setPlaylistCurrentVideoIndex(0);
    setPlaylistSelectedFormats({});
    setPlaylistVideoInfoCache({});
  }, []);

  const getBestFormatID = useCallback((info: VideoInfo): string => {
    const bestFormat = info.formats
      .filter(format => {
        return (format.resolution || (format.acodec !== 'none' && format.vcodec === 'none')) && format.format_id;
      })
      .sort((a, b) => {
        if (b.resolution && a.resolution) {
          const [aWidth, aHeight] = a.resolution.split('x').map(Number);
          const [bWidth, bHeight] = b.resolution.split('x').map(Number);

          if (bHeight !== aHeight) {
            return bHeight - aHeight;
          }

          if (bWidth !== aWidth) {
            return bWidth - aWidth;
          }

          if (b.filesize && a.filesize) {
            return Number(b.filesize) - Number(a.filesize);
          }
        }

        if (!a.resolution && b.resolution) return 1;
        if (a.resolution && !b.resolution) return -1;

        return 0;
      })[0];

    return bestFormat?.format_id || '';
  }, []);

  const resolvePlaylistEntryURL = useCallback((entry: PlaylistEntry): string => {
    const entryURL = (entry.url || '').trim();
    if (entryURL.startsWith('http://') || entryURL.startsWith('https://')) {
      return entryURL;
    }

    if (entryURL.startsWith('//')) {
      return `https:${entryURL}`;
    }

    if (entryURL.startsWith('/')) {
      return `https://www.youtube.com${entryURL}`;
    }

    const entryID = (entry.id || '').trim();
    if (entryID && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      return `https://www.youtube.com/watch?v=${entryID}`;
    }

    return entryURL || entryID;
  }, [url]);

  const prefetchPlaylistVideoInfo = useCallback(async (videoIDs: string[], startIndex: number, count = 1) => {
    if (!playlistInfo || videoIDs.length === 0) return;

    const targets = videoIDs.slice(startIndex, startIndex + count);
    const tasks = targets.map(async (videoID) => {
      if (!videoID || playlistVideoInfoCache[videoID]) {
        return;
      }

      const entry = playlistInfo.entries.find((item: PlaylistEntry) => item.id === videoID);
      if (!entry) return;

      try {
        const entryURL = resolvePlaylistEntryURL(entry);
        const result = await apiService.analyzeURL(entryURL);
        const info = JSON.parse(result);
        setPlaylistVideoInfoCache(prev => {
          if (prev[videoID]) return prev;
          return { ...prev, [videoID]: info };
        });
      } catch (error) {
        console.warn('Prefetch playlist video failed:', error);
      }
    });

    await Promise.all(tasks);
  }, [playlistInfo, playlistVideoInfoCache, resolvePlaylistEntryURL]);

  const loadPlaylistVideoForStep = useCallback(async (videoIDs: string[], stepIndex: number) => {
    if (!playlistInfo || !videoIDs[stepIndex]) {
      throw new Error('Playlist data is unavailable');
    }

    const videoID = videoIDs[stepIndex];
    const entry = playlistInfo.entries.find((item: PlaylistEntry) => item.id === videoID);
    if (!entry) {
      throw new Error('Could not find selected video in playlist');
    }

    let info = playlistVideoInfoCache[videoID];
    if (!info) {
      const entryURL = resolvePlaylistEntryURL(entry);
      const result = await apiService.analyzeURL(entryURL);
      info = JSON.parse(result);
      setPlaylistVideoInfoCache(prev => ({ ...prev, [videoID]: info }));
    }

    setVideoInfo(info);
    setPlaylistCurrentVideoIndex(stepIndex);

    const savedFormat = playlistSelectedFormats[videoID];
    setSelectedFormat(savedFormat || '');

    void prefetchPlaylistVideoInfo(videoIDs, stepIndex + 1, 2);
  }, [playlistInfo, playlistVideoInfoCache, playlistSelectedFormats, getBestFormatID, resolvePlaylistEntryURL, prefetchPlaylistVideoInfo]);

  // Функция для анализа URL
  const handleAnalyze = async () => {
    if (!url.trim()) {
      showError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    try {
      // First, try to analyze as a playlist
      try {
        const playlistResult = await apiService.analyzePlaylist(url);
        const parsedPlaylistResult = JSON.parse(playlistResult);

        if (parsedPlaylistResult && parsedPlaylistResult.entries && parsedPlaylistResult.entries.length > 0) {
          // This is a playlist
          resetPlaylistVideoFlow();
          setPlaylistInfo(parsedPlaylistResult);
          setCurrentStep('playlist');
          showSuccess('Playlist analyzed successfully!');
          return;
        }
      } catch (playlistError) {
        // If playlist analysis fails, continue with video analysis
        console.info('Not a playlist, treating as video:', playlistError);
      }

      // If not a playlist, treat as a single video
      const result = await apiService.analyzeURL(url);
      const parsedResult: VideoInfo = JSON.parse(result);

      if (!parsedResult || !parsedResult.title) {
        throw new Error('Invalid video information received');
      }

      setVideoInfo(parsedResult);
      setSelectedFormat('');
      setCurrentStep('selection');
      showSuccess('Video analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError(`Analysis failed: ${errorMessage}\n\nPlease check the URL and try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Функция для быстрого анализа и загрузки
  const handleAnalyzeAndDownloadFast = async () => {
    if (!url.trim()) {
      showError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    try {
      // First, try to analyze as a playlist
      try {
        const playlistResult = await apiService.analyzePlaylist(url);
        const parsedPlaylistResult = JSON.parse(playlistResult);

        if (parsedPlaylistResult && parsedPlaylistResult.entries && parsedPlaylistResult.entries.length > 0) {
          // This is a playlist - download all videos with best format
          setPlaylistInfo(parsedPlaylistResult);

          // Get the first video to determine the best format
          if (parsedPlaylistResult.entries.length > 0) {
            const firstVideoUrl = parsedPlaylistResult.entries[0].url;
            const firstVideoInfo = JSON.parse(await apiService.analyzeURL(firstVideoUrl));

            const bestFormat = firstVideoInfo.formats
              .filter((format: any) => {
                return (format.resolution || (format.acodec !== 'none' && format.vcodec === 'none')) && format.format_id;
              })
              .sort((a: any, b: any) => {
                if (b.resolution && a.resolution) {
                  const [aWidth, aHeight] = a.resolution.split('x').map(Number);
                  const [bWidth, bHeight] = b.resolution.split('x').map(Number);

                  if (bHeight !== aHeight) {
                    return bHeight - aHeight;
                  }

                  if (bWidth !== aWidth) {
                    return bWidth - aWidth;
                  }

                  if (b.filesize && a.filesize) {
                    return Number(b.filesize) - Number(a.filesize);
                  }
                }

                if (!a.resolution && b.resolution) return 1;
                if (a.resolution && !b.resolution) return -1;

                return 0;
              })[0];

            if (bestFormat) {
              setIsAnalyzing(false);
              setIsDownloading(true);
              setDownloadProgress(0);
              setDownloadSize('Calculating...');
              setDownloadSpeed('Calculating...');
              setDownloadEta('Calculating...');
              setCurrentStep('download');

              try {
                // Download the entire playlist
                const playlistTitle = parsedPlaylistResult.title || 'playlist';
                const outputPath = await apiService.getDownloadPath(`${playlistTitle}_%(title)s`);
                await apiService.downloadPlaylist(url, bestFormat.format_id, outputPath, 1, 0); // 0 means no end limit
                showSuccess('Playlist download completed successfully!');
              } catch (error) {
                console.error('Playlist download error:', error);
                setIsDownloading(false);
                setCurrentStep('input');
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                showError(`Playlist download failed: ${errorMessage}\n\nPlease try again with a different format.`);
              }
            } else {
              showError('No suitable format found for playlist download');
            }
          }
          return;
        }
      } catch (playlistError) {
        // If playlist analysis fails, continue with video analysis
        console.info('Not a playlist, treating as video:', playlistError);
      }

      // If not a playlist, treat as a single video
      const result = await apiService.analyzeURL(url);
      const parsedResult: VideoInfo = JSON.parse(result);

      if (!parsedResult || !parsedResult.title) {
        throw new Error('Invalid video information received');
      }

      setVideoInfo(parsedResult);

      // Автоматически выбираем лучший формат
      const bestFormat = parsedResult.formats
        .filter(format => {
          return (format.resolution || (format.acodec !== 'none' && format.vcodec === 'none')) && format.format_id;
        })
        .sort((a, b) => {
          if (b.resolution && a.resolution) {
            const [aWidth, aHeight] = a.resolution.split('x').map(Number);
            const [bWidth, bHeight] = b.resolution.split('x').map(Number);

            if (bHeight !== aHeight) {
              return bHeight - aHeight;
            }

            if (bWidth !== aWidth) {
              return bWidth - aWidth;
            }

            if (b.filesize && a.filesize) {
              return Number(b.filesize) - Number(a.filesize);
            }
          }

          if (!a.resolution && b.resolution) return 1;
          if (a.resolution && !b.resolution) return -1;

          return 0;
        })[0];

      if (bestFormat) {
        setSelectedFormat(bestFormat.format_id);

        setIsAnalyzing(false);
        setIsDownloading(true);
        setDownloadProgress(0);
        setDownloadSize('Calculating...');
        setDownloadSpeed('Calculating...');
        setDownloadEta('Calculating...');
        setCurrentStep('download');

        try {
          const outputPath = await apiService.getDownloadPath(parsedResult.title);
          setDownloadPath(outputPath);
          await apiService.downloadVideo(url, bestFormat.format_id, outputPath);
          showSuccess('Download completed successfully!');
        } catch (error) {
          console.error('Download error:', error);
          setIsDownloading(false);
          setCurrentStep('input');
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          showError(`Download failed: ${errorMessage}\n\nPlease try again with a different format.`);
        }
      } else {
        showError('No suitable format found for download');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError(`Analysis failed: ${errorMessage}\n\nPlease check the URL and try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Функция для загрузки видео
  const handleDownload = useCallback(async () => {
    if (!videoInfo || !selectedFormat) {
      showError('Please select a format first');
      return;
    }

    // Добавляем в очередь загрузок
    downloadQueueManager.addToQueue({
      url: url,
      formatID: selectedFormat,
      outputPath: await apiService.getDownloadPath(videoInfo.title),
      title: videoInfo.title,
      priority: 'normal'
    });

    showSuccess('Download added to queue!');
    // Перенаправляем на экран очереди только если включена настройка
    if (autoRedirectToQueue) {
      setCurrentStep('queue');
    }
  }, [videoInfo, selectedFormat, url, autoRedirectToQueue]);

  // Функция для отмены загрузки
  const handleCancelDownload = async () => {
    try {
      await apiService.cancelDownload();
      setIsDownloading(false);
      setCurrentStep('input');
      showSuccess('Download cancelled!');
    } catch (error) {
      console.error('Cancel download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError(`Failed to cancel download: ${errorMessage}`);
    }
  };

  // Функция для отмены загрузки из очереди
  const handleCancelQueueItem = (id: string) => {
    downloadQueueManager.cancelDownload(id);
    showSuccess('Download cancelled from queue!');
  };

  // Функция для очистки завершенных загрузок из очереди
  const handleClearCompleted = () => {
    downloadQueueManager.clearCompleted();
    showSuccess('Completed downloads cleared from queue!');
  };

  // Функция для открытия файла в проводнике
  const handleOpenInExplorer = async () => {
    try {
      const actualPath = await resolveActualOutputPath(downloadPath);
      await apiService.openInExplorer(actualPath);
    } catch (error) {
      console.error('Error opening in explorer:', error);
      showError('Failed to open file location');
    }
  };

  // Функция для конвертации видео
  const handleConvertVideo = async (path?: string) => {
    try {
      const sourcePath = path || downloadPath;
      const actualPath = await resolveActualOutputPath(sourcePath);
      setDownloadPath(actualPath);
      setCurrentStep('conversion');
      // Don't show success message here - let the conversion events handle it
    } catch (error) {
      console.error('Error starting conversion:', error);
      showError('Failed to start conversion');
    }
  };

  // Функция для возврата на главную
  const handleGoToHome = () => {
    resetPlaylistVideoFlow();
    setCurrentStep('input');
    setUrl('');
    setVideoInfo(null);
    setSelectedFormat('');
  };

  // Функция для перехода к очереди
  const handleGoToQueue = () => {
    setCurrentStep('queue');
  };

  // Функция для перехода к истории
  const handleGoToHistory = () => {
    setCurrentStep('history');
  };

  // Функция для удаления элемента из истории
  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await downloadHistoryDB.deleteItem(id);
      const history = await downloadHistoryDB.getAllItems();
      setDownloadHistory(history);
      showSuccess('Item removed from history!');
    } catch (error) {
      console.error('Failed to delete history item:', error);
      showError('Failed to remove item from history');
    }
  };

  // Функция для очистки истории
  const handleClearHistory = async () => {
    try {
      await downloadHistoryDB.clearAll();
      setDownloadHistory([]);
      showSuccess('History cleared!');
    } catch (error) {
      console.error('Failed to clear history:', error);
      showError('Failed to clear history');
    }
  };

  // Функция для очистки всей очереди загрузок
  const handleClearQueue = () => {
    downloadQueueManager.clearAll();
    showSuccess('Queue cleared!');
  };

  // Функция для очистки кеша
  const handleClearCache = () => {
    downloadQueueManager.clearCache();
    showSuccess('Cache cleared!');
  };

  // Форматирование длительности
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Функция для загрузки выбранных видео из плейлиста
  const handleDownloadSelectedPlaylistVideos = async () => {
    if (!playlistInfo || selectedVideos.length === 0) {
      showError('Please select videos to download');
      return;
    }

    const selectedVideoIDs = playlistInfo.entries
      .filter((entry: PlaylistEntry) => selectedVideos.includes(entry.id))
      .map((entry: PlaylistEntry) => entry.id);

    if (selectedVideoIDs.length === 0) {
      showError('Could not find selected video');
      return;
    }

    try {
      setIsAnalyzing(true);
      setIsPlaylistVideoFlowActive(true);
      setPlaylistVideoFlowIds(selectedVideoIDs);
      setPlaylistCurrentVideoIndex(0);
      setPlaylistSelectedFormats({});
      setPlaylistVideoInfoCache({});
      setSelectedFormat('');

      await loadPlaylistVideoForStep(selectedVideoIDs, 0);
      setCurrentStep('selection');
    } catch (error) {
      console.error('Error getting video info for format selection:', error);
      showError('Could not get video format information');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlaylistVideoFlowPrevious = async () => {
    if (!isPlaylistVideoFlowActive || playlistVideoFlowIds.length === 0) {
      return;
    }

    const currentVideoID = playlistVideoFlowIds[playlistCurrentVideoIndex];
    if (currentVideoID && selectedFormat) {
      setPlaylistSelectedFormats(prev => ({ ...prev, [currentVideoID]: selectedFormat }));
    }

    const previousIndex = playlistCurrentVideoIndex - 1;
    if (previousIndex < 0) {
      resetPlaylistVideoFlow();
      setCurrentStep('playlist');
      return;
    }

    try {
      setIsAnalyzing(true);
      await loadPlaylistVideoForStep(playlistVideoFlowIds, previousIndex);
      setCurrentStep('selection');
    } catch (error) {
      console.error('Error loading previous playlist video:', error);
      showError('Could not load previous playlist video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlaylistVideoFlowNextOrDownload = async () => {
    if (!isPlaylistVideoFlowActive || playlistVideoFlowIds.length === 0) {
      return;
    }

    if (!selectedFormat) {
      showError('Please select a format first');
      return;
    }

    const currentVideoID = playlistVideoFlowIds[playlistCurrentVideoIndex];
    const updatedFormats: Record<string, string> = {
      ...playlistSelectedFormats,
      [currentVideoID]: selectedFormat,
    };
    setPlaylistSelectedFormats(updatedFormats);

    const isLastVideo = playlistCurrentVideoIndex >= playlistVideoFlowIds.length - 1;
    if (!isLastVideo) {
      try {
        setIsAnalyzing(true);
        await loadPlaylistVideoForStep(playlistVideoFlowIds, playlistCurrentVideoIndex + 1);
        setCurrentStep('selection');
      } catch (error) {
        console.error('Error loading next playlist video:', error);
        showError('Could not load next playlist video');
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    try {
      for (const videoID of playlistVideoFlowIds) {
        const playlistEntry = playlistInfo.entries.find((entry: PlaylistEntry) => entry.id === videoID);
        const formatID = updatedFormats[videoID];
        if (!playlistEntry || !formatID) {
          continue;
        }

        const outputPath = await apiService.getDownloadPath(`${playlistInfo.title || 'playlist'} - ${playlistEntry.title}`);

        downloadQueueManager.addToQueue({
          url: resolvePlaylistEntryURL(playlistEntry),
          formatID,
          outputPath,
          title: playlistEntry.title,
          priority: 'normal',
        });
      }

      showSuccess(`Added ${playlistVideoFlowIds.length} videos to download queue!`);
      resetPlaylistVideoFlow();

      if (autoRedirectToQueue) {
        setCurrentStep('queue');
      } else {
        setCurrentStep('input');
      }
    } catch (error) {
      console.error('Error queuing playlist videos:', error);
      showError('Could not add playlist videos to queue');
    }
  };

  return {
    // Состояния
    url, setUrl,
    isAnalyzing, setIsAnalyzing,
    isDownloading, setIsDownloading,
    setupProgress, setSetupProgress,
    downloadProgress, setDownloadProgress,
    downloadSize, setDownloadSize,
    downloadSpeed, setDownloadSpeed,
    downloadEta, setDownloadEta,
    currentStep, setCurrentStep,
    videoInfo, setVideoInfo,
    playlistInfo, setPlaylistInfo,
    selectedFormat, setSelectedFormat,
    selectedVideos, setSelectedVideos,
    isPlaylistVideoFlowActive,
    playlistCurrentVideoIndex,
    playlistVideoFlowTotal: playlistVideoFlowIds.length,
    ffmpegWarning, setFfmpegWarning,
    showSettings, setShowSettings,
    proxyMode, setProxyMode,
    proxyAddress, setProxyAddress,
    cookiesMode, setCookiesMode,
    cookiesBrowser, setCookiesBrowser,
    cookiesFile, setCookiesFile,
    autoRedirectToQueue, setAutoRedirectToQueue,
    useJSRuntime, setUseJSRuntime,
    jsRuntimeType, setJsRuntimeType,
    currentYtDlpVersion, setCurrentYtDlpVersion,
    latestYtDlpVersion, setLatestYtDlpVersion,
    isCheckingVersion, setIsCheckingVersion,
    isUpdatingYtDlp, setIsUpdatingYtDlp,
    showUpdateProgress, setShowUpdateProgress,
    updateProgress, setUpdateProgress,
    updateStatus, setUpdateStatus,
    showAppUpdateModal, setShowAppUpdateModal,
    currentAppVersion,
    latestAppVersion,
    releaseNotes,
    downloadUrl,
    isCheckingAppVersion,
    queueItems, setQueueItems,
    downloadHistory, setDownloadHistory,
    notification, setNotification,
    downloadPath, setDownloadPath,

    // Функции
    loadSettings,
    saveSettings,
    checkYtDlpVersion,
    updateYtDlp,
    checkAppVersion,
    openAppUpdateModal,
    selectCookiesFile,
    handleAnalyze,
    handleAnalyzeAndDownloadFast,
    handleDownload,
    handleDownloadSelectedPlaylistVideos,
    handlePlaylistVideoFlowPrevious,
    handlePlaylistVideoFlowNextOrDownload,
    handleCancelDownload,
    handleOpenInExplorer,
    handleConvertVideo,
    handleGoToHome,
    handleCancelQueueItem,
    handleClearCompleted,
    handleDeleteHistoryItem,
    handleClearHistory,
    handleClearQueue,
    handleClearCache,
    handleGoToQueue,
    handleGoToHistory,
    formatDuration,
    formatFileSize
  };
};

