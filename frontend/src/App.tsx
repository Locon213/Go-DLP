import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Snackbar, Alert, AlertTitle, Tooltip, Badge, Fade } from '@mui/material';
import { Settings as SettingsIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon, History as HistoryIcon, List as QueueIcon } from '@mui/icons-material';

// Import logo
import logoImage from './assets/logo.png';

// Import components
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

// Import hooks and types
import { useAppLogic } from './hooks/useAppLogic';
import { useLanguage } from './i18n/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { apiService } from './services/api';

const App: React.FC = () => {
  // Use the hook for all application logic
  const {
    // States
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
    useJSRuntime, setUseJSRuntime,
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

    // Functions
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

  // Function to close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Get language and theme from context
  const { language, setLanguage, t } = useLanguage();
  const { darkMode, toggleTheme, themeStyle, themeStyles } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with Glass Effect */}
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{
            backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            mb: 4,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', pl: 2, pr: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={handleGoToHome}
            >
              <Box
                component="img"
                src={logoImage}
                alt="Go-DLP"
                sx={{
                  height: 80,
                  width: 'auto',
                  mr: 2,
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: darkMode ? 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' : 'none',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary} 0%, ${themeStyles[themeStyle].secondary} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Go-DLP
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.appSubtitle}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={t.downloadQueueTooltip}>
                <IconButton
                  onClick={handleGoToQueue}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <Badge
                    badgeContent={queueItems.filter(item => item.status === 'pending' || item.status === 'in-progress').length}
                    color="primary"
                    max={99}
                  >
                    <QueueIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t.downloadHistoryTooltip}>
                <IconButton
                  onClick={handleGoToHistory}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={darkMode ? t.switchToLightMode : t.switchToDarkMode}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t.settingsTooltip}>
                <IconButton
                  onClick={() => {
                    loadSettings();
                    setShowSettings(true);
                  }}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Subtitle */}
        <Typography
          variant="h6"
          align="center"
          sx={{
            mb: 4,
            color: 'text.secondary',
            fontWeight: 400,
          }}
        >
          {t.appSubtitle}
        </Typography>

        {/* FFmpeg Warning */}
        {ffmpegWarning && (
          <Fade in={!!ffmpegWarning}>
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                borderRadius: 3,
                animation: 'slideInDown 0.3s ease-out',
              }}
            >
              {ffmpegWarning}
            </Alert>
          </Fade>
        )}

        {/* Main Content with Fade Transitions */}
        <Box sx={{ position: 'relative' }}>
          {/* Setup Screen */}
          <Fade in={currentStep === 'setup'} unmountOnExit>
            <Box sx={{ display: currentStep === 'setup' ? 'block' : 'none' }}>
              <SetupScreen setupProgress={setupProgress} />
            </Box>
          </Fade>

          {/* Input Screen */}
          <Fade in={currentStep === 'input'} unmountOnExit>
            <Box sx={{ display: currentStep === 'input' ? 'block' : 'none' }}>
              <InputScreen
                url={url}
                setUrl={setUrl}
                isAnalyzing={isAnalyzing}
                handleAnalyze={handleAnalyze}
                handleAnalyzeAndDownloadFast={handleAnalyzeAndDownloadFast}
              />
            </Box>
          </Fade>

          {/* Selection Screen */}
          <Fade in={currentStep === 'selection' && !!videoInfo} unmountOnExit>
            <Box sx={{ display: currentStep === 'selection' && videoInfo ? 'block' : 'none' }}>
              <SelectionScreen
                videoInfo={videoInfo!}
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
                setCurrentStep={setCurrentStep}
                isDownloading={isDownloading}
                formatDuration={formatDuration}
                formatFileSize={formatFileSize}
              />
            </Box>
          </Fade>

          {/* Save Path Screen */}
          <Fade in={currentStep === 'savepath' && !!videoInfo} unmountOnExit>
            <Box sx={{ display: currentStep === 'savepath' && videoInfo ? 'block' : 'none' }}>
              <SavePathScreen
                videoInfo={videoInfo!}
                onBack={() => setCurrentStep('selection')}
                onConfirm={() => {
                  handleDownload();
                }}
              />
            </Box>
          </Fade>

          {/* Download Screen */}
          <Fade in={currentStep === 'download'} unmountOnExit>
            <Box sx={{ display: currentStep === 'download' ? 'block' : 'none' }}>
              <DownloadScreen
                videoInfo={videoInfo}
                downloadProgress={downloadProgress}
                downloadSize={downloadSize}
                downloadSpeed={downloadSpeed}
                downloadEta={downloadEta}
                onCancelDownload={handleCancelDownload}
              />
            </Box>
          </Fade>

          {/* Completion Screen */}
          <Fade in={currentStep === 'completion' && !!videoInfo} unmountOnExit>
            <Box sx={{ display: currentStep === 'completion' && videoInfo ? 'block' : 'none' }}>
              <CompletionScreen
                videoInfo={videoInfo!}
                downloadPath={downloadPath || ''}
                onOpenInExplorer={handleOpenInExplorer}
                onGoToHome={handleGoToHome}
                onConvertVideo={handleConvertVideo}
              />
            </Box>
          </Fade>

          {/* Conversion Screen */}
          <Fade in={currentStep === 'conversion' && !!downloadPath} unmountOnExit>
            <Box sx={{ display: currentStep === 'conversion' && downloadPath ? 'block' : 'none' }}>
              <ConversionScreen
                sourceFile={downloadPath!}
                onBack={() => setCurrentStep('completion')}
                onConvert={async (targetFormat: string) => {
                  await apiService.convertVideo(downloadPath!, targetFormat);
                }}
              />
            </Box>
          </Fade>

          {/* Playlist Screen */}
          <Fade in={currentStep === 'playlist' && !!playlistInfo} unmountOnExit>
            <Box sx={{ display: currentStep === 'playlist' && playlistInfo ? 'block' : 'none' }}>
              <PlaylistScreen
                playlistInfo={playlistInfo!}
                selectedVideos={selectedVideos}
                setSelectedVideos={setSelectedVideos}
                onBack={() => setCurrentStep('input')}
                onDownloadSelected={handleDownloadSelectedPlaylistVideos}
                isDownloading={isDownloading}
                formatDuration={formatDuration}
              />
            </Box>
          </Fade>

          {/* Queue Screen */}
          <Fade in={currentStep === 'queue'} unmountOnExit>
            <Box sx={{ display: currentStep === 'queue' ? 'block' : 'none' }}>
              <QueueScreen
                queueItems={queueItems}
                onCancelDownload={handleCancelQueueItem}
                onClearCompleted={handleClearCompleted}
                onGoToHome={handleGoToHome}
                onOpenInExplorer={handleOpenInExplorer}
                onConvertVideo={handleConvertVideo}
              />
            </Box>
          </Fade>

          {/* History Screen */}
          <Fade in={currentStep === 'history'} unmountOnExit>
            <Box sx={{ display: currentStep === 'history' ? 'block' : 'none' }}>
              <HistoryScreen
                historyItems={downloadHistory}
                onDeleteItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                onGoToHome={handleGoToHome}
              />
            </Box>
          </Fade>
        </Box>

        {/* Notification Toast */}
        <Snackbar
          open={!!notification}
          autoHideDuration={5000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={Fade}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification?.type === 'error' ? 'error' : 'success'}
            sx={{
              width: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
            variant="filled"
          >
            <AlertTitle>{notification?.type === 'error' ? t.error : t.success}</AlertTitle>
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
          useJSRuntime={useJSRuntime}
          setUseJSRuntime={setUseJSRuntime}
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
    </Box>
  );
};

export default App;