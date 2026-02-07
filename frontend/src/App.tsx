import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Snackbar, Alert, AlertTitle, Tooltip, Badge } from '@mui/material';
import { Settings as SettingsIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon, History as HistoryIcon, List as QueueIcon } from '@mui/icons-material';

// Импорт логотипа
import logoImage from './assets/logo.png';

// Импорты компонентов
import SetupScreen from './components/SetupScreen';
import InputScreen from './components/InputScreen';
import SelectionScreen from './components/SelectionScreen';
import SavePathScreen from './components/SavePathScreen';
import DownloadScreen from './components/DownloadScreen';
import CompletionScreen from './components/CompletionScreen';
import ConversionScreen from './components/ConversionScreen';
import SettingsModal from './components/SettingsModal';
import PlaylistScreen from './components/PlaylistScreen';
import QueueScreen from './components/QueueScreen';
import HistoryScreen from './components/HistoryScreen';
import UpdateProgressModal from './components/UpdateProgressModal';
import AppUpdateModal from './components/AppUpdateModal';

// Импорты хука и типов
import { useAppLogic } from './hooks/useAppLogic';
import { useLanguage } from './i18n/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { apiService } from './services/api';

const App: React.FC = () => {
  // Используем хук для всей логики приложения
  const {
    // Состояния
    url, setUrl,
    isAnalyzing,
    isDownloading,
    setupProgress,
    downloadProgress,
    downloadSize,
    downloadSpeed,
    downloadEta,
    currentStep, setCurrentStep,
    videoInfo,
    playlistInfo,
    selectedFormat, setSelectedFormat,
    selectedVideos, setSelectedVideos,
    ffmpegWarning,
    showSettings, setShowSettings,
    proxyMode, setProxyMode,
    proxyAddress, setProxyAddress,
    cookiesMode, setCookiesMode,
    cookiesBrowser, setCookiesBrowser,
    cookiesFile, setCookiesFile,
    autoRedirectToQueue, setAutoRedirectToQueue,
    currentYtDlpVersion,
    latestYtDlpVersion,
    isCheckingVersion,
    isUpdatingYtDlp,
    showUpdateProgress,
    updateProgress,
    updateStatus,
    showAppUpdateModal, setShowAppUpdateModal,
    currentAppVersion,
    latestAppVersion,
    releaseNotes,
    downloadUrl,
    isCheckingAppVersion,
    notification, setNotification,
    downloadPath,
    queueItems,
    downloadHistory,

    // Функции
    loadSettings,
    saveSettings,
    checkYtDlpVersion,
    updateYtDlp,
    checkAppVersion,
    selectCookiesFile,
    handleAnalyze,
    handleAnalyzeAndDownloadFast,
    handleDownload,
    handleDownloadSelectedPlaylistVideos,
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
  } = useAppLogic();

  // Функция для закрытия уведомления
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Получаем язык и тему из контекста
  const { language, setLanguage } = useLanguage();
  const { darkMode, toggleTheme } = useTheme();

  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
          <AppBar position="static" color="default" elevation={0} sx={{ backgroundColor: 'transparent', boxShadow: 'none', mb: 4 }}>
            <Toolbar sx={{ justifyContent: 'space-between', pl: 0, pr: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="img"
                  src={logoImage}
                  alt="Go-DLP"
                  onClick={handleGoToHome}
                  sx={{
                    height: 120,
                    width: 'auto',
                    mr: 1,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title="Download Queue">
                  <IconButton onClick={handleGoToQueue} color="inherit">
                    <Badge badgeContent={queueItems.filter(item => item.status === 'pending' || item.status === 'in-progress').length} color="primary">
                      <QueueIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download History">
                  <IconButton onClick={handleGoToHistory} color="inherit">
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                  <IconButton onClick={toggleTheme} color="inherit">
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton
                    onClick={() => {
                      loadSettings();
                      setShowSettings(true);
                    }}
                    color="inherit"
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          <Typography variant="h6" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
            Modern yt-dlp Desktop Client
          </Typography>

          {ffmpegWarning && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              ⚠️ {ffmpegWarning}
            </Alert>
          )}

          {/* --- Setup Screen --- */}
          {currentStep === 'setup' && (
            <SetupScreen setupProgress={setupProgress} />
          )}

          {/* --- Input Screen --- */}
          {currentStep === 'input' && (
            <InputScreen
              url={url}
              setUrl={setUrl}
              isAnalyzing={isAnalyzing}
              handleAnalyze={handleAnalyze}
              handleAnalyzeAndDownloadFast={handleAnalyzeAndDownloadFast}
            />
          )}

          {/* --- Selection Screen --- */}
          {currentStep === 'selection' && videoInfo && (
            <SelectionScreen
              videoInfo={videoInfo}
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              setCurrentStep={setCurrentStep}
              isDownloading={isDownloading}
              formatDuration={formatDuration}
              formatFileSize={formatFileSize}
            />
          )}

          {/* --- Save Path Screen --- */}
          {currentStep === 'savepath' && videoInfo && (
            <SavePathScreen
              videoInfo={videoInfo}
              onBack={() => setCurrentStep('selection')}
              onConfirm={() => {
                handleDownload();
              }}
            />
          )}

          {/* --- Download Screen --- */}
          {currentStep === 'download' && (
            <DownloadScreen
              videoInfo={videoInfo}
              downloadProgress={downloadProgress}
              downloadSize={downloadSize}
              downloadSpeed={downloadSpeed}
              downloadEta={downloadEta}
              onCancelDownload={handleCancelDownload}
            />
          )}

          {/* --- Completion Screen --- */}
          {currentStep === 'completion' && videoInfo && (
            <CompletionScreen
              videoInfo={videoInfo}
              downloadPath={downloadPath || ''}
              onOpenInExplorer={handleOpenInExplorer}
              onGoToHome={handleGoToHome}
              onConvertVideo={handleConvertVideo}
            />
          )}

          {/* --- Conversion Screen --- */}
          {currentStep === 'conversion' && downloadPath && (
            <ConversionScreen
              sourceFile={downloadPath}
              onBack={() => setCurrentStep('completion')}
              onConvert={async (targetFormat: string) => {
                await apiService.convertVideo(downloadPath, targetFormat);
              }}
            />
          )}

          {/* --- Playlist Screen --- */}
          {currentStep === 'playlist' && playlistInfo && (
            <PlaylistScreen
              playlistInfo={playlistInfo}
              selectedVideos={selectedVideos}
              setSelectedVideos={setSelectedVideos}
              onBack={() => setCurrentStep('input')}
              onDownloadSelected={handleDownloadSelectedPlaylistVideos}
              isDownloading={isDownloading}
              formatDuration={formatDuration}
            />
          )}

          {/* --- Queue Screen --- */}
          {currentStep === 'queue' && (
            <QueueScreen
              queueItems={queueItems}
              onCancelDownload={handleCancelQueueItem}
              onClearCompleted={handleClearCompleted}
              onGoToHome={handleGoToHome}
              onOpenInExplorer={handleOpenInExplorer}
              onConvertVideo={handleConvertVideo}
            />
          )}

          {/* --- History Screen --- */}
          {currentStep === 'history' && (
            <HistoryScreen
              historyItems={downloadHistory}
              onDeleteItem={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onGoToHome={handleGoToHome}
            />
          )}

          {/* Notification Toast */}
          <Snackbar
            open={!!notification}
            autoHideDuration={5000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseNotification}
              severity={notification?.type === 'error' ? 'error' : 'success'}
              sx={{ width: '100%' }}
            >
              <AlertTitle>{notification?.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              {notification?.message}
            </Alert>
          </Snackbar>

          {/* Update Progress Modal */}
          <UpdateProgressModal
            open={showUpdateProgress}
            progress={updateProgress}
            status={updateStatus}
            onClose={() => {}}
          />

          {/* Settings Modal */}
          <SettingsModal
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            language={language}
            setLanguage={setLanguage}
            proxyMode={proxyMode}
            setProxyMode={setProxyMode}
            proxyAddress={proxyAddress}
            setProxyAddress={setProxyAddress}
            cookiesMode={cookiesMode}
            setCookiesMode={setCookiesMode}
            cookiesBrowser={cookiesBrowser}
            setCookiesBrowser={setCookiesBrowser}
            cookiesFile={cookiesFile}
            setCookiesFile={setCookiesFile}
            autoRedirectToQueue={autoRedirectToQueue}
            setAutoRedirectToQueue={setAutoRedirectToQueue}
            currentYtDlpVersion={currentYtDlpVersion}
            latestYtDlpVersion={latestYtDlpVersion}
            isCheckingVersion={isCheckingVersion}
            isUpdatingYtDlp={isUpdatingYtDlp}
            checkYtDlpVersion={checkYtDlpVersion}
            updateYtDlp={updateYtDlp}
            selectCookiesFile={selectCookiesFile}
            saveSettings={saveSettings}
            clearQueue={handleClearQueue}
            clearCache={handleClearCache}
            currentAppVersion={currentAppVersion}
            latestAppVersion={latestAppVersion}
            isCheckingAppVersion={isCheckingAppVersion}
            checkAppVersion={checkAppVersion}
          />

          {/* App Update Modal */}
          <AppUpdateModal
            open={showAppUpdateModal}
            currentVersion={currentAppVersion}
            latestVersion={latestAppVersion}
            releaseNotes={releaseNotes}
            downloadUrl={downloadUrl}
            onClose={() => setShowAppUpdateModal(false)}
          />
        </Container>
  );
};

export default App;