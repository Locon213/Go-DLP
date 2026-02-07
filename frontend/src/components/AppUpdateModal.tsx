import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { useLanguage } from '../i18n/LanguageContext';

interface AppUpdateModalProps {
  open: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string;
  onClose: () => void;
}

const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  open,
  currentVersion,
  latestVersion,
  releaseNotes,
  downloadUrl,
  onClose,
}) => {
  const { t } = useLanguage();
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (latestVersion && currentVersion) {
      setUpdateAvailable(latestVersion !== currentVersion);
    }
  }, [latestVersion, currentVersion]);

  const handleClose = () => {
    setUpdateAvailable(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">{t.appUpdate}</Typography>
          {currentVersion && (
            <Chip 
              label={`v${currentVersion}`}
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {updateAvailable ? (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body1" fontWeight="bold" color="primary.contrastText">
                  {t.updateAvailable}
                </Typography>
                <Typography variant="body2" color="primary.contrastText" sx={{ mt: 1 }}>
                  {t.currentVersion}: {currentVersion}
                </Typography>
                <Typography variant="body2" color="primary.contrastText">
                  {t.latestVersion}: {latestVersion}
                </Typography>
              </Box>

              {releaseNotes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t.releaseNotes}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      p: 2,
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      component="pre"
                      sx={{ 
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                      }}
                    >
                      {releaseNotes}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                href={downloadUrl}
                target="_blank"
              >
                {t.downloadUpdate}
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {t.updateNotAvailable}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.currentVersion}: {currentVersion}
              </Typography>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t.aboutApp}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.aboutAppDescription}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {t.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppUpdateModal;
