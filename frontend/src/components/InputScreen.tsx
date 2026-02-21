import React, { useRef, useState, useCallback } from 'react';
import { Box, Card, Typography, TextField, Button, Grid, InputAdornment, IconButton, CircularProgress, Paper, Snackbar, Alert } from '@mui/material';
import { ContentCopy as ContentCopyIcon, Visibility as VisibilityIcon, CloudDownload as CloudDownloadIcon, PlayCircle as PlayCircleIcon, FolderOpen as FolderOpenIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';

interface InputScreenProps {
  url: string;
  setUrl: (url: string) => void;
  isAnalyzing: boolean;
  handleAnalyze: () => void;
  handleAnalyzeAndDownloadFast: () => void;
  onUrlsFromFiles?: (urls: string[]) => void;
}

const InputScreen: React.FC<InputScreenProps> = ({
  url,
  setUrl,
  isAnalyzing,
  handleAnalyze,
  handleAnalyzeAndDownloadFast,
  onUrlsFromFiles
}) => {
  const { t } = useLanguage();
  const { themeStyles, themeStyle } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clipboardSnackbar, setClipboardSnackbar] = useState(false);
  const [fileMessage, setFileMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Инициализация Wails File Drop API
  React.useEffect(() => {
    let dispose: (() => void) | undefined;
    const initFileDrop = async () => {
      try {
        const { OnFileDrop, OnFileDropOff, CanResolveFilePaths } = await import('../../wailsjs/runtime/runtime');
        
        // Проверяем, доступна ли функция разрешения путей
        if (CanResolveFilePaths()) {
          OnFileDrop((_x: number, _y: number, paths: string[]) => {
            handleDroppedPaths(paths);
          }, false);

          dispose = () => {
            OnFileDropOff();
          };
        }
      } catch (err) {
        console.log('Wails OnFileDrop not available, using HTML5 drag-drop fallback');
      }
    };

    initFileDrop();
    return () => {
      if (dispose) {
        dispose();
      }
    };
  }, []);

  // Обработка перетаскиваемых путей файлов от Wails
  const handleDroppedPaths = async (paths: string[]) => {
    setFileMessage(null);
    setDragOver(false);

    if (paths.length === 0) return;

    try {
      const processedItems = await apiService.processDroppedFiles(paths);
      const urls = processedItems
        .filter(item => item.type === 'url')
        .map(item => item.value);

      if (urls.length > 0) {
        if (onUrlsFromFiles) {
          onUrlsFromFiles(urls);
        }
        if (urls.length === 1) {
          setUrl(urls[0]);
          setFileMessage({ type: 'success', text: `URL загружен из файла` });
        } else {
          setUrl(urls[0]);
          setFileMessage({ type: 'success', text: `Загружено ${urls.length} URL. Первый вставлен в поле.` });
        }
      } else {
        setFileMessage({ type: 'error', text: 'URL не найдены в перетаскиваемых файлах' });
      }
    } catch (err) {
      console.error('Failed to process dropped files:', err);
      setFileMessage({ type: 'error', text: 'Не удалось обработать перетаскиваемые файлы' });
    }
  };

  // HTML5 Drag and Drop обработчики
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    const files = event.dataTransfer.files;
    const text = event.dataTransfer.getData('text');

    // Сначала проверяем, есть ли перетаскиваемый текст (URL)
    if (text && text.trim()) {
      const urlRegex = /^https?:\/\/.+/i;
      const trimmedText = text.trim();
      if (urlRegex.test(trimmedText)) {
        setUrl(trimmedText);
        setFileMessage({ type: 'success', text: 'URL вставлен из перетаскиваемого текста' });
        return;
      }
    }

    // Обработка файлов
    if (files.length > 0) {
      const allUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Проверяем, что это TXT файл
        if (file.name.toLowerCase().endsWith('.txt')) {
          try {
            // Читаем файл через FileReader
            const fileText = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsText(file);
            });

            // Извлекаем URL из текста
            const urlRegex = /https?:\/\/[^\s"']+/g;
            const matches = fileText.match(urlRegex);
            if (matches) {
              allUrls.push(...matches);
            }
          } catch (err) {
            console.error('Failed to read dropped file:', err);
          }
        }
      }

      if (allUrls.length > 0) {
        if (onUrlsFromFiles) {
          onUrlsFromFiles(allUrls);
        }
        if (allUrls.length === 1) {
          setUrl(allUrls[0]);
          setFileMessage({ type: 'success', text: `URL загружен из перетаскиваемого файла` });
        } else {
          setUrl(allUrls[0]);
          setFileMessage({ type: 'success', text: `Загружено ${allUrls.length} URL из файла` });
        }
      } else {
        setFileMessage({ type: 'error', text: 'Не удалось извлечь URL из файла' });
      }
    }
  }, [onUrlsFromFiles, setUrl]);

  // Функция для вставки из буфера обмена
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.trim()) {
        setUrl(clipboardText.trim());
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  // Автоматическая вставка из буфера обмена при монтировании
  React.useEffect(() => {
    const autoPasteFromClipboard = async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.trim() && !url.trim()) {
          // Проверяем, есть ли в буфере обмена URL
          const urlRegex = /^https?:\/\/.+/i;
          if (urlRegex.test(clipboardText.trim())) {
            setUrl(clipboardText.trim());
            setClipboardSnackbar(true);
          }
        }
      } catch (err) {
        // Игнорируем ошибки, если буфер обмена недоступен
        console.log('Clipboard auto-paste not available');
      }
    };

    // Запускаем через небольшую задержку после монтирования
    const timer = setTimeout(autoPasteFromClipboard, 500);
    return () => clearTimeout(timer);
  }, []);

  // Обработка выбора файла через диалог Wails
  const handleFileSelectClick = async () => {
    try {
      const filePath = await apiService.selectTextFile();
      
      if (filePath) {
        setFileMessage(null);
        try {
          const urls = await apiService.readLinksFromFile(filePath);
          if (urls.length === 1) {
            setUrl(urls[0]);
            setFileMessage({ type: 'success', text: `URL загружен из файла` });
          } else if (urls.length > 1) {
            setUrl(urls[0]);
            setFileMessage({ type: 'success', text: `Загружено ${urls.length} URL. Первый вставлен в поле.` });
            if (onUrlsFromFiles) {
              onUrlsFromFiles(urls);
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Ошибка чтения файла';
          setFileMessage({ type: 'error', text: errorMsg });
        }
      }
    } catch (err) {
      console.error('Failed to open file dialog:', err);
      // Fallback: пробуем открыть через скрытый input
      fileInputRef.current?.click();
    }
  };

  // Обработка выбора файла через input (резервный вариант)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // @ts-ignore - путь к файлу доступен в Wails
      const filePath = (file as any).path || '';
      if (filePath && file.name.toLowerCase().endsWith('.txt')) {
        try {
          const urls = await apiService.readLinksFromFile(filePath);
          allUrls.push(...urls);
        } catch (err) {
          console.error('Failed to read links from file:', err);
        }
      }
    }

    if (allUrls.length > 0) {
      if (onUrlsFromFiles) {
        onUrlsFromFiles(allUrls);
      } else if (allUrls.length === 1) {
        setUrl(allUrls[0]);
        setFileMessage({ type: 'success', text: `URL загружен из файла` });
      } else {
        setUrl(allUrls[0]);
        setFileMessage({ type: 'success', text: `Загружено ${allUrls.length} URL` });
      }
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Main Input Card */}
      <Card
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary} 0%, ${themeStyles[themeStyle].secondary} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
            mb: 3,
          }}
        >
          {t.downloadMedia}
        </Typography>

        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* File Message Alert */}
          {fileMessage && (
            <Alert
              severity={fileMessage.type}
              onClose={() => setFileMessage(null)}
              sx={{ mb: 2 }}
            >
              {fileMessage.text}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t.enterUrl}
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.urlPlaceholder}
            disabled={isAnalyzing}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handlePasteFromClipboard}
                    edge="end"
                    title={t.pasteFromClipboard}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleFileSelectClick}
                    edge="end"
                    title={t.selectFile}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <FolderOpenIcon />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                },
              },
            }}
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleAnalyze}
                disabled={!url.trim() || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <VisibilityIcon />}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                {isAnalyzing ? t.analyzing : t.analyze}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAnalyzeAndDownloadFast}
                disabled={!url.trim() || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
                }}
              >
                {isAnalyzing ? t.analyzing : t.analyzeAndDownload}
              </Button>
            </Grid>
          </Grid>

          {/* Drag and Drop Hint */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: dragOver ? 'primary.main' : 'divider',
              textAlign: 'center',
              bgcolor: dragOver ? 'action.selected' : 'action.hover',
              opacity: dragOver ? 1 : 0.7,
              transition: 'all 0.2s ease',
            }}
          >
            <UploadIcon sx={{ fontSize: 24, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {t.dragAndDropHint}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary}20 0%, ${themeStyles[themeStyle].secondary}20 100%)`,
              }}
            >
              <Typography variant="h3">{'\u{1F680}'}</Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t.featuresLightningFast}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.featuresLightningFastDesc}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary}20 0%, ${themeStyles[themeStyle].secondary}20 100%)`,
              }}
            >
              <Typography variant="h3">{'\u{1F512}'}</Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t.featuresSecurePrivate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.featuresSecurePrivateDesc}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary}20 0%, ${themeStyles[themeStyle].secondary}20 100%)`,
              }}
            >
              <Typography variant="h3">{'\u{1F48E}'}</Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t.featuresHighQuality}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.featuresHighQualityDesc}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Supported Platforms */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: 'transparent',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <PlayCircleIcon sx={{ fontSize: 18, opacity: 0.6 }} />
          {t.supportedPlatforms}
        </Typography>
      </Paper>

      {/* Clipboard Auto-Paste Snackbar */}
      <Snackbar
        open={clipboardSnackbar}
        autoHideDuration={3000}
        onClose={() => setClipboardSnackbar(false)}
        message={t.clipboardAutoPasted}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default InputScreen;
