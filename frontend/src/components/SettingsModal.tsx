import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Radio, RadioGroup, FormControlLabel, FormControl, TextField, InputAdornment, IconButton, Alert, CircularProgress, Switch, LinearProgress } from '@mui/material';
import { Close as CloseIcon, Folder as FolderIcon, Visibility as VisibilityIcon, CloudDownload as CloudDownloadIcon, Language as LanguageIcon, Delete as DeleteIcon, CleaningServices as ClearCacheIcon, Update as UpdateIcon, Terminal as TerminalIcon } from '@mui/icons-material';
import LanguageSelector from './LanguageSelector';
// Browser icons
import ChromeIcon from '../assets/google-chrome.svg';
import FirefoxIcon from '../assets/firefox.svg';
import EdgeIcon from '../assets/microsoft-edge.svg';
import OperaIcon from '../assets/opera.svg';
import { LanguageCode } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import { GetDenoVersion, GetLatestDenoVersion, InstallDeno, UpdateDeno, IsDenoAvailable } from '../../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';

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
  clearQueue: () => void;
  clearCache: () => void;
  currentAppVersion: string;
  latestAppVersion: string;
  isCheckingAppVersion: boolean;
  checkAppVersion: () => void;
}

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
  clearQueue,
  clearCache,
  currentAppVersion,
  latestAppVersion,
  isCheckingAppVersion,
  checkAppVersion,
}) => {
  const { t } = useLanguage();
  
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

  return (
    <Dialog
      open={showSettings}
      onClose={() => setShowSettings(false)}
      maxWidth="sm"
      fullWidth
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
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          {/* Language Settings */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon /> {t.settings}
          </Typography>
          <Box sx={{ mb: 3 }}>
            <LanguageSelector
              language={language}
              onLanguageChange={setLanguage}
              label={t.settings}
            />
          </Box>

          {/* Queue Settings */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {t.downloadQueue}
          </Typography>
          <Box sx={{ mb: 3 }}>
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
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {t.autoRedirectToQueueDescription}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={clearQueue}
                startIcon={<DeleteIcon />}
                sx={{ flex: 1 }}
                color="error"
              >
                Clear Queue
              </Button>
              <Button
                variant="outlined"
                onClick={clearCache}
                startIcon={<ClearCacheIcon />}
                sx={{ flex: 1 }}
                color="warning"
              >
                Clear Cache
              </Button>
            </Box>
          </Box>

          {/* Proxy Settings */}
          <Typography variant="h6" gutterBottom>
            {t.proxy}
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <RadioGroup
              aria-label="proxy-mode"
              name="proxy-mode"
              value={proxyMode}
              onChange={(e) => setProxyMode(e.target.value as 'none' | 'system' | 'manual')}
            >
              <FormControlLabel value="none" control={<Radio />} label="No Proxy" />
              <FormControlLabel value="system" control={<Radio />} label="Use System Proxy" />
              <FormControlLabel value="manual" control={<Radio />} label="Manual Proxy" />
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
              />
            )}
          </FormControl>

          {/* Cookies Settings */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {t.cookies}
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <RadioGroup
              aria-label="cookies-mode"
              name="cookies-mode"
              value={cookiesMode}
              onChange={(e) => setCookiesMode(e.target.value as 'none' | 'browser' | 'file')}
            >
              <FormControlLabel value="none" control={<Radio />} label="No Cookies" />
              <FormControlLabel value="browser" control={<Radio />} label="Extract from Browser" />
              <FormControlLabel value="file" control={<Radio />} label="Use Cookie File" />
            </RadioGroup>

            {cookiesMode === 'browser' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Browser:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant={cookiesBrowser === 'chrome' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('chrome')}
                    startIcon={<img src={ChromeIcon} alt="Chrome" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}
                  >
                    Chrome
                  </Button>
                  <Button
                    variant={cookiesBrowser === 'firefox' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('firefox')}
                    startIcon={<img src={FirefoxIcon} alt="Firefox" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}
                  >
                    Firefox
                  </Button>
                  <Button
                    variant={cookiesBrowser === 'edge' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('edge')}
                    startIcon={<img src={EdgeIcon} alt="Edge" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}
                  >
                    Edge
                  </Button>
                  <Button
                    variant={cookiesBrowser === 'opera' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('opera')}
                    startIcon={<img src={OperaIcon} alt="Opera" style={{ width: 20, height: 20 }} />}
                    sx={{ flex: '1 1 calc(50% - 8px)', minWidth: '120px' }}
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
                          title="Browse file"
                        >
                          <FolderIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Click the folder icon to browse for cookie file
                </Typography>
              </Box>
            )}
          </FormControl>

          {/* JS Runtime Settings */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalIcon /> JavaScript Runtime (Deno)
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useJSRuntime}
                  onChange={(e) => setUseJSRuntime(e.target.checked)}
                  color="primary"
                />
              }
              label="Use JavaScript Runtime for YouTube and other sites"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Enable JavaScript runtime (Deno) for sites that require it, especially YouTube. Allows access to higher quality video formats.
            </Typography>
          </Box>

          {/* Deno Status Section */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Deno Status: {denoInstalled ? (
                <Typography component="span" color="success.main">Installed</Typography>
              ) : (
                <Typography component="span" color="error.main">Not Installed</Typography>
              )}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.currentVersion}: {currentDenoVersion || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.latestVersion}: {latestDenoVersion || '-'}
            </Typography>
            
            {currentDenoVersion && latestDenoVersion && currentDenoVersion !== latestDenoVersion && (
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                Update available! Current: {currentDenoVersion}, Latest: {latestDenoVersion}
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
                sx={{ flex: 1 }}
              >
                {isCheckingDeno ? 'Checking...' : t.checkUpdate}
              </Button>
              
              {!denoInstalled ? (
                <Button
                  variant="contained"
                  onClick={handleInstallDeno}
                  disabled={isInstallingDeno}
                  startIcon={isInstallingDeno ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                  sx={{ flex: 1 }}
                >
                  {isInstallingDeno ? 'Installing...' : 'Install'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleUpdateDeno}
                  disabled={isInstallingDeno || !latestDenoVersion}
                  startIcon={isInstallingDeno ? <CircularProgress size={20} /> : <UpdateIcon />}
                  sx={{ flex: 1 }}
                >
                  {isInstallingDeno ? t.updating : t.update}
                </Button>
              )}
            </Box>
          </Box>

          {/* yt-dlp Version Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            yt-dlp {t.version}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.currentVersion}: {currentYtDlpVersion || 'Not checked'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.latestVersion}: {latestYtDlpVersion || 'Not checked'}
            </Typography>
            {currentYtDlpVersion && latestYtDlpVersion && currentYtDlpVersion !== latestYtDlpVersion && (
              <Alert severity="info" sx={{ mt: 1 }}>
                New version available! Current: {currentYtDlpVersion}, Latest: {latestYtDlpVersion}
              </Alert>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={checkYtDlpVersion}
              disabled={isCheckingVersion}
              startIcon={isCheckingVersion ? <CircularProgress size={20} /> : <VisibilityIcon />}
              sx={{ flex: 1 }}
            >
              {isCheckingVersion ? t.updating : t.checkUpdate}
            </Button>
            <Button
              variant="contained"
              onClick={updateYtDlp}
              disabled={isUpdatingYtDlp || !latestYtDlpVersion}
              startIcon={isUpdatingYtDlp ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
              sx={{ flex: 1 }}
            >
              {isUpdatingYtDlp ? t.updating : t.update}
            </Button>
          </Box>

          {/* App Update Section */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Go-DLP {t.version}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.currentVersion}: {currentAppVersion || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.latestVersion}: {latestAppVersion || '-'}
            </Typography>
            {currentAppVersion && latestAppVersion && currentAppVersion !== latestAppVersion && (
              <Alert severity="info" sx={{ mt: 1 }}>
                {t.updateAvailable}! {t.currentVersion}: {currentAppVersion}, {t.latestVersion}: {latestAppVersion}
              </Alert>
            )}
          </Box>

          <Button
            variant="outlined"
            onClick={checkAppVersion}
            disabled={isCheckingAppVersion}
            startIcon={isCheckingAppVersion ? <CircularProgress size={20} /> : <UpdateIcon />}
            fullWidth
          >
            {isCheckingAppVersion ? t.updating : t.checkUpdate}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSettings(false)}>{t.cancel}</Button>
        <Button variant="contained" onClick={saveSettings}>{t.save}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;