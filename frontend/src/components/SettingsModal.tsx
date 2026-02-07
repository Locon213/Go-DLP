import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Radio, RadioGroup, FormControlLabel, FormControl, TextField, InputAdornment, IconButton, Alert, CircularProgress, Switch } from '@mui/material';
import { Close as CloseIcon, Folder as FolderIcon, Visibility as VisibilityIcon, CloudDownload as CloudDownloadIcon, AccountCircle as ChromeIcon, AccountBox as FirefoxIcon, Language as LanguageIcon, Delete as DeleteIcon, CleaningServices as ClearCacheIcon, Update as UpdateIcon } from '@mui/icons-material';
import LanguageSelector from './LanguageSelector';
import { LanguageCode } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';

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
  cookiesBrowser: 'chrome' | 'firefox';
  setCookiesBrowser: (browser: 'chrome' | 'firefox') => void;
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
  clearQueue,
  clearCache,
  currentAppVersion,
  latestAppVersion,
  isCheckingAppVersion,
  checkAppVersion,
}) => {
  const { t } = useLanguage();

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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant={cookiesBrowser === 'chrome' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('chrome')}
                    startIcon={<ChromeIcon />}
                    sx={{ flex: 1 }}
                  >
                    Chrome
                  </Button>
                  <Button
                    variant={cookiesBrowser === 'firefox' ? 'contained' : 'outlined'}
                    onClick={() => setCookiesBrowser('firefox')}
                    startIcon={<FirefoxIcon />}
                    sx={{ flex: 1 }}
                  >
                    Firefox
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