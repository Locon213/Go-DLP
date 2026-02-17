import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Radio, RadioGroup, FormControlLabel, FormControl, TextField, InputAdornment, IconButton, Alert, CircularProgress, Switch, LinearProgress, Divider, Grid, Paper } from '@mui/material';
import { Close as CloseIcon, Folder as FolderIcon, Visibility as VisibilityIcon, CloudDownload as CloudDownloadIcon, Language as LanguageIcon, Delete as DeleteIcon, CleaningServices as ClearCacheIcon, Update as UpdateIcon, Terminal as TerminalIcon, Palette as PaletteIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, Check as CheckIcon } from '@mui/icons-material';
import LanguageSelector from './LanguageSelector';
// Browser icons
import ChromeIcon from '../assets/google-chrome.svg';
import FirefoxIcon from '../assets/firefox.svg';
import EdgeIcon from '../assets/microsoft-edge.svg';
import OperaIcon from '../assets/opera.svg';
import type { LanguageCode } from '../i18n';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { GetDenoVersion, GetLatestDenoVersion, InstallDeno, UpdateDeno, IsDenoAvailable } from '../../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';
import type { ThemeStyle } from '../theme';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  proxyMode: 'none' | 'system' | 'manual';
  setProxyMode: (mode: 'none' | 'system' | 'manual') => void;
  proxyAddress: string;
  setProxyAddress: (address: string) => void;
  cookiesMode: 'none' | 'browser' | 'file';
  setCookiesMode: (mode: 'none' | 'browser' | 'file') => void;
  cookiesBrowser: 'chrome' | 'firefox' | 'opera' | 'edge';
  setCookiesBrowser: (browser: 'chrome' | 'firefox' | 'opera' | 'edge') => void;
  cookiesFile: string;
  setCookiesFile: (file: string) => void;
  currentYtDlpVersion: string;
  latestYtDlpVersion: string;
  isCheckingVersion: boolean;
  isUpdatingYtDlp: boolean;
  checkYtDlpVersion: () => void;
  updateYtDlp: () => void;
  selectCookiesFile: () => void;
  saveSettings: () => void;
  autoRedirectToQueue: boolean;
  setAutoRedirectToQueue: (value: boolean) => void;
  useJSRuntime: boolean;
  setUseJSRuntime: (value: boolean) => void;
  jsRuntimeType: 'deno' | 'node';
  setJsRuntimeType: (value: 'deno' | 'node') => void;
  clearQueue: () => void;
  clearCache: () => void;
  currentAppVersion: string;
  latestAppVersion: string;
  isCheckingAppVersion: boolean;
  checkAppVersion: () => void;
}

// Theme style preview colors
const themePreviewColors: Record<ThemeStyle, { primary: string; secondary: string; accent: string }> = {
  default: { primary: '#1976d2', secondary: '#7c4dff', accent: '#00bcd4' },
  ocean: { primary: '#0288d1', secondary: '#00796b', accent: '#26c6da' },
  forest: { primary: '#2e7d32', secondary: '#558b2f', accent: '#8bc34a' },
  sunset: { primary: '#e65100', secondary: '#f57c00', accent: '#ff9800' },
  lavender: { primary: '#7b1fa2', secondary: '#9c27b0', accent: '#e040fb' },
  midnight: { primary: '#283593', secondary: '#303f9f', accent: '#536dfe' },
  rose: { primary: '#c2185b', secondary: '#d81b60', accent: '#ff4081' },
  monochrome: { primary: '#424242', secondary: '#616161', accent: '#9e9e9e' },
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  showSettings,
  setShowSettings,
  language,
  setLanguage,
  proxyMode,
  setProxyMode,
  proxyAddress,
  setProxyAddress,
  cookiesMode,
  setCookiesMode,
  cookiesBrowser,
  setCookiesBrowser,
  cookiesFile,
  setCookiesFile,
  currentYtDlpVersion,
  latestYtDlpVersion,
  isCheckingVersion,
  isUpdatingYtDlp,
  checkYtDlpVersion,
  updateYtDlp,
  selectCookiesFile,
  saveSettings,
  autoRedirectToQueue,
  setAutoRedirectToQueue,
  useJSRuntime,
  setUseJSRuntime,
  jsRuntimeType,
  setJsRuntimeType,
  clearQueue,
  clearCache,
  currentAppVersion,
  latestAppVersion,
  isCheckingAppVersion,
  checkAppVersion,
}) => {
  const { t } = useLanguage();
  const { darkMode, toggleTheme, themeStyle, setThemeStyle, themeStyles, getThemeName } = useTheme();
  
  // Deno state
  const [denoInstalled, setDenoInstalled] = useState(false);
  const [currentDenoVersion, setCurrentDenoVersion] = useState<string>('');
  const [latestDenoVersion, setLatestDenoVersion] = useState<string>('');
  const [isCheckingDeno, setIsCheckingDeno] = useState(false);
  const [isInstallingDeno, setIsInstallingDeno] = useState(false);
  const [denoDownloadProgress, setDenoDownloadProgress] = useState(0);
  const [denoDownloadStatus, setDenoDownloadStatus] = useState('');

  // Check Deno status on mount
  useEffect(() => {
    if (showSettings) {
      checkDenoStatus();
    }
  }, [showSettings]);

  // Listen for Deno download events
  useEffect(() => {
    EventsOn('deno-download-start', () => {
      setIsInstallingDeno(true);
      setDenoDownloadProgress(0);
      setDenoDownloadStatus('Starting download...');
    });

    EventsOn('deno-download-progress', (data: any) => {
      setDenoDownloadProgress(data.progress);
      if (data.status === 'extracting') {
        setDenoDownloadStatus('Extracting...');
      } else {
        const downloadedMB = (data.downloaded / (1024 * 1024)).toFixed(1);
        const totalMB = (data.total / (1024 * 1024)).toFixed(1);
        setDenoDownloadStatus(`Downloading... ${downloadedMB}MB / ${totalMB}MB`);
      }
    });

    EventsOn('deno-download-complete', () => {
      setIsInstallingDeno(false);
      setDenoDownloadProgress(100);
      setDenoDownloadStatus('Installation complete!');
      checkDenoStatus();
      // Clear status after 3 seconds
      setTimeout(() => {
        setDenoDownloadStatus('');
        setDenoDownloadProgress(0);
      }, 3000);
    });

    EventsOn('deno-download-error', (error: string) => {
      setIsInstallingDeno(false);
      setDenoDownloadStatus(`Error: ${error}`);
      // Clear error after 5 seconds
      setTimeout(() => {
        setDenoDownloadStatus('');
        setDenoDownloadProgress(0);
      }, 5000);
    });

    return () => {
      EventsOff('deno-download-start');
      EventsOff('deno-download-progress');
      EventsOff('deno-download-complete');
      EventsOff('deno-download-error');
    };
  }, []);

  const checkDenoStatus = async () => {
    setIsCheckingDeno(true);
    try {
      const installed = await IsDenoAvailable();
      setDenoInstalled(installed);
      
      if (installed) {
        const version = await GetDenoVersion();
        setCurrentDenoVersion(version);
      } else {
        setCurrentDenoVersion('');
      }
      
      const latest = await GetLatestDenoVersion();
      setLatestDenoVersion(latest);
    } catch (error) {
      console.error('Error checking Deno status:', error);
    } finally {
      setIsCheckingDeno(false);
    }
  };

  const handleInstallDeno = async () => {
    setIsInstallingDeno(true);
    setDenoDownloadProgress(0);
    setDenoDownloadStatus('Starting download...');
    try {
      // The function will emit events that update the progress
      // We don't need to await it - events will handle the state
      InstallDeno().catch((err) => {
        console.error('InstallDeno error:', err);
        setIsInstallingDeno(false);
        setDenoDownloadStatus(`Error: ${err}`);
      });
    } catch (error) {
      console.error('Error installing Deno:', error);
      setIsInstallingDeno(false);
    }
  };

  const handleUpdateDeno = async () => {
    setIsInstallingDeno(true);
    setDenoDownloadProgress(0);
    setDenoDownloadStatus('Starting update...');
    try {
      // The function will emit events that update the progress
      UpdateDeno().catch((err) => {
        console.error('UpdateDeno error:', err);
        setIsInstallingDeno(false);
        setDenoDownloadStatus(`Error: ${err}`);
      });
    } catch (error) {
      console.error('Error updating Deno:', error);
      setIsInstallingDeno(false);
    }
  };

  // Theme style card component
  const ThemeStyleCard: React.FC<{ style: ThemeStyle }> = ({ style }) => {
    const colors = themePreviewColors[style];
    const isSelected = themeStyle === style;
    const themeName = getThemeName(style);
    
    return (
      <Paper
        elevation={0}
        onClick={() => setThemeStyle(style)}
        sx={{
          p: 1.5,
          cursor: 'pointer',
          border: '2px solid',
          borderColor: isSelected ? colors.primary : 'divider',
          borderRadius: 3,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: colors.primary,
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${colors.primary}30`,
          },
        }}
      >
        {/* Color preview */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <Box
            sx={{
              width: '100%',
              height: 24,
              borderRadius: 1.5,
              bgcolor: colors.primary,
            }}
          />
          <Box
            sx={{
              width: '100%',
              height: 24,
              borderRadius: 1.5,
              bgcolor: colors.secondary,
            }}
          />
          <Box
            sx={{
              width: '100%',
              height: 24,
              borderRadius: 1.5,
              bgcolor: colors.accent,
            }}
          />
        </Box>
        
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSelected ? 600 : 400,
            color: isSelected ? colors.primary : 'text.primary',
            textAlign: 'center',
          }}
        >
          {themeName}
        </Typography>
        
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon sx={{ fontSize: 14, color: 'white' }} />
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Dialog
      open={showSettings}
      onClose={() => setShowSettings(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        {t.settings}
        <IconButton
          aria-label="close"
          onClick={() => setShowSettings(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 3 }}>
        <Box sx={{ py: 1 }}>
          {/* Language Settings */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LanguageIcon /> {t.language}
          </Typography>
          <Box sx={{ mb: 4 }}>
            <LanguageSelector
              language={language}
              onLanguageChange={setLanguage}
              label={t.language}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Theme Settings */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PaletteIcon /> {t.themeSection || 'Appearance'}
          </Typography>
          
          {/* Dark Mode Toggle */}
          <Box sx={{ mb: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {darkMode ? (
                  <DarkModeIcon sx={{ color: 'primary.main' }} />
                ) : (
                  <LightModeIcon sx={{ color: 'primary.main' }} />
                )}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {darkMode ? (t.darkMode || 'Dark Mode') : (t.lightMode || 'Light Mode')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {darkMode ? (t.darkModeDescription || 'Switch to light theme') : (t.lightModeDescription || 'Switch to dark theme')}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                color="primary"
              />
            </Paper>
          </Box>

          {/* Theme Style Selection */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            {t.themeStyle || 'Color Theme'}
          </Typography>
          <Grid container spacing={2}>
            {(Object.keys(themeStyles) as ThemeStyle[]).map((style) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={style}>
                <ThemeStyleCard
                  style={style}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Queue Settings */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {t.downloadQueue}
          </Typography>
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRedirectToQueue}
                  onChange={(e) => setAutoRedirectToQueue(e.target.checked)}
                  color="primary"
                />
              }
              label={t.autoRedirectToQueue}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 2 }}>
              {t.autoRedirectToQueueDescription}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={clearQueue}
                startIcon={<DeleteIcon />}
                sx={{ flex: 1, borderRadius: 3 }}
                color="error"
              >
                {t.clearQueue}
              </Button>
              <Button
                variant="outlined"
                onClick={clearCache}
                startIcon={<ClearCacheIcon />}
                sx={{ flex: 1, borderRadius: 3 }}
                color="warning"
              >
                {t.clearCache}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Proxy Settings */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t.proxy}
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 4 }}>
            <RadioGroup
              aria-label="proxy-mode"
              name="proxy-mode"
              value={proxyMode}
              onChange={(e) => setProxyMode(e.target.value as 'none' | 'system' | 'manual')}
            >
              <FormControlLabel value="none" control={<Radio />} label={t.noProxyOption} />
              <FormControlLabel value="system" control={<Radio />} label={t.useSystemProxyOption} />
              <FormControlLabel value="manual" control={<Radio />} label={t.manualProxyOption} />
            </RadioGroup>

            {proxyMode === 'manual' && (
              <TextField
                fullWidth
                label={t.proxyAddress}
                variant="outlined"
                value={proxyAddress}
                onChange={(e) => setProxyAddress(e.target.value)}
                placeholder="Enter proxy address (e.g., http://proxy.example.com:8080)"
                margin="normal"
                sx={{ mt: 2 }}
              />
            )}
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Cookies Settings */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t.cookies}
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 4 }}>
            <RadioGroup
              aria-label="cookies-mode"
              name="cookies-mode"
              value={cookiesMode}
              onChange={(e) => setCookiesMode(e.target.value as 'none' | 'browser' | 'file')}
            >
              <FormControlLabel value="none" control={<Radio />} label={t.noCookiesOption} />
              <FormControlLabel value="browser" control={<Radio />} label={t.extractFromBrowserOption} />
              <FormControlLabel value="file" control={<Radio />} label={t.useCookieFileOption} />
            </RadioGroup>

            {cookiesMode === 'browser' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t.selectBrowserLabel}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant={cookiesBrowser === 'chrome' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('chrome')}
                    startIcon={<img src={ChromeIcon} alt="Chrome" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px', borderRadius: 3 }}
                  >
                    Chrome
                  </Button>
                  <Button
                    variant={cookiesBrowser === 'firefox' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('firefox')}
                    startIcon={<img src={FirefoxIcon} alt="Firefox" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px', borderRadius: 3 }}
                  >
                    Firefox
                  </Button>
                  <Button
                    variant={cookiesBrowser === 'edge' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('edge')}
                    startIcon={<img src={EdgeIcon} alt="Edge" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px', borderRadius: 3 }}
                  >
                    Edge
                  </Button>
                  <Button
                    variant={cookiesBrowser === 'opera' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('opera')}
                    startIcon={<img src={OperaIcon} alt="Opera" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px', borderRadius: 3 }}
                  >
                    Opera
                  </Button>
                </Box>
              </Box>
            )}

            {cookiesMode === 'file' && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label={t.cookiesFile}
                  variant="outlined"
                  value={cookiesFile}
                  onChange={(e) => setCookiesFile(e.target.value)}
                  placeholder="Path to cookies file"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={selectCookiesFile}
                          edge="end"
                          title={t.clickFolderIconForCookieFile}
                        >
                          <FolderIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {t.clickFolderIconForCookieFile}
                </Typography>
              </Box>
            )}
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* JS Runtime Settings */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TerminalIcon /> {t.useJavaScriptRuntime}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useJSRuntime}
                  onChange={(e) => setUseJSRuntime(e.target.checked)}
                  color="primary"
                />
              }
              label={t.useJavaScriptRuntime}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 2 }}>
              {t.useJavaScriptRuntimeDescription}
            </Typography>

            {/* JS Runtime Type Selection */}
            {useJSRuntime && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select JavaScript Runtime
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    variant={jsRuntimeType === 'deno' ? 'contained' : 'outlined'}
                    onClick={() => setJsRuntimeType('deno')}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      borderColor: jsRuntimeType === 'deno' ? 'primary.main' : undefined,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">Deno</Typography>
                      {jsRuntimeType === 'deno' && <CheckIcon sx={{ fontSize: 16 }} />}
                    </Box>
                    {jsRuntimeType === 'deno' && (
                      <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                        Recommended
                      </Typography>
                    )}
                  </Button>
                  <Button
                    variant={jsRuntimeType === 'node' ? 'contained' : 'outlined'}
                    onClick={() => setJsRuntimeType('node')}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      borderColor: jsRuntimeType === 'node' ? 'primary.main' : undefined,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">Node.js</Typography>
                      {jsRuntimeType === 'node' && <CheckIcon sx={{ fontSize: 16 }} />}
                    </Box>
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  {jsRuntimeType === 'deno'
                    ? 'Deno is a modern, secure runtime with built-in dependency management.'
                    : 'Node.js is a widely-used JavaScript runtime. Better if you already have it installed.'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Deno Status Section */}
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {t.denoStatus}: {denoInstalled ? (
                <Typography component="span" color="success.main">{t.denoInstalled}</Typography>
              ) : (
                <Typography component="span" color="error.main">{t.denoNotInstalled}</Typography>
              )}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.currentVersion}: {currentDenoVersion || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.latestVersion}: {latestDenoVersion || '-'}
            </Typography>
            
            {currentDenoVersion && latestDenoVersion && currentDenoVersion !== latestDenoVersion && (
              <Alert severity="info" sx={{ mt: 1, mb: 1, borderRadius: 2 }}>
                {t.denoUpdateAvailable} {t.ytDlpCurrentVersion}: {currentDenoVersion}, {t.ytDlpLatestVersion}: {latestDenoVersion}
              </Alert>
            )}

            {/* Download Progress */}
            {(isInstallingDeno || denoDownloadProgress > 0 || denoDownloadStatus) && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {denoDownloadStatus}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={denoDownloadProgress}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {denoDownloadProgress}%
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={checkDenoStatus}
                disabled={isCheckingDeno || isInstallingDeno}
                startIcon={isCheckingDeno ? <CircularProgress size={20} /> : <VisibilityIcon />}
                sx={{ flex: 1, borderRadius: 3 }}
              >
                {isCheckingDeno ? t.denoChecking : t.denoCheckUpdate}
              </Button>

              {!denoInstalled ? (
                <Button
                  variant="contained"
                  onClick={handleInstallDeno}
                  disabled={isInstallingDeno}
                  startIcon={isInstallingDeno ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                  sx={{ flex: 1, borderRadius: 3 }}
                >
                  {isInstallingDeno ? t.denoInstalling : t.denoInstall}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleUpdateDeno}
                  disabled={isInstallingDeno || !latestDenoVersion}
                  startIcon={isInstallingDeno ? <CircularProgress size={20} /> : <UpdateIcon />}
                  sx={{ flex: 1, borderRadius: 3 }}
                >
                  {isInstallingDeno ? t.updating : t.update}
                </Button>
              )}
            </Box>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* yt-dlp Version Section */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t.ytDlpVersion}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.ytDlpCurrentVersion}: {currentYtDlpVersion || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.ytDlpLatestVersion}: {latestYtDlpVersion || '-'}
            </Typography>
            {currentYtDlpVersion && latestYtDlpVersion && currentYtDlpVersion !== latestYtDlpVersion && (
              <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                {t.ytDlpUpdateAvailable} {t.ytDlpCurrentVersion}: {currentYtDlpVersion}, {t.ytDlpLatestVersion}: {latestYtDlpVersion}
              </Alert>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="outlined"
              onClick={checkYtDlpVersion}
              disabled={isCheckingVersion}
              startIcon={isCheckingVersion ? <CircularProgress size={20} /> : <VisibilityIcon />}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              {isCheckingVersion ? t.updating : t.checkUpdate}
            </Button>
            <Button
              variant="contained"
              onClick={updateYtDlp}
              disabled={isUpdatingYtDlp || !latestYtDlpVersion}
              startIcon={isUpdatingYtDlp ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              {isUpdatingYtDlp ? t.updating : t.update}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* App Update Section */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t.appVersionSection}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.appCurrentVersion}: {currentAppVersion || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.appLatestVersion}: {latestAppVersion || '-'}
            </Typography>
            {currentAppVersion && latestAppVersion && currentAppVersion !== latestAppVersion && (
              <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                {t.appUpdateAvailableMessage}! {t.appCurrentVersion}: {currentAppVersion}, {t.appLatestVersion}: {latestAppVersion}
              </Alert>
            )}
          </Box>

          <Button
            variant="outlined"
            onClick={checkAppVersion}
            disabled={isCheckingAppVersion}
            startIcon={isCheckingAppVersion ? <CircularProgress size={20} /> : <UpdateIcon />}
            fullWidth
            sx={{ borderRadius: 3 }}
          >
            {isCheckingAppVersion ? t.updating : t.checkUpdate}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => setShowSettings(false)} sx={{ borderRadius: 3, px: 3 }}>
          {t.cancel}
        </Button>
        <Button variant="contained" onClick={saveSettings} sx={{ borderRadius: 3, px: 3 }}>
          {t.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;