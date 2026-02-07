import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Grid, Paper, Avatar, TextField, Divider } from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  LocationOn as LocationOnIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { VideoInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { apiService } from '../services/api';

interface SavePathScreenProps {
  videoInfo: VideoInfo;
  onBack: () => void;
  onConfirm: (customPath?: string) => void;
}

const SavePathScreen: React.FC<SavePathScreenProps> = ({
  videoInfo,
  onBack,
  onConfirm
}) => {
  const { t } = useLanguage();
  const [downloadDir, setDownloadDir] = useState<string>('');
  const [customPath, setCustomPath] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  useEffect(() => {
    // Load current download directory on mount
    loadDownloadDirectory();
  }, []);

  const loadDownloadDirectory = async () => {
    try {
      const dir = await apiService.getDownloadDirectory();
      setDownloadDir(dir);
    } catch (error) {
      console.error('Failed to load download directory:', error);
      setDownloadDir('./downloads');
    }
  };

  const handleSelectDirectory = async () => {
    setIsSelecting(true);
    try {
      const selectedPath = await apiService.selectDownloadDirectory();
      if (selectedPath) {
        setDownloadDir(selectedPath);
        setCustomPath(''); // Clear custom path when directory is selected
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleUseCustomPath = () => {
    if (customPath.trim()) {
      // Validate and set custom path
      apiService.setDownloadDirectory(customPath.trim())
        .then(() => {
          onConfirm(customPath.trim());
        })
        .catch((error) => {
          console.error('Failed to set custom directory:', error);
          alert('Failed to set custom directory. Please check the path and try again.');
        });
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      p: 2
    }}>
      <Card sx={{
        maxWidth: 800,
        width: '100%',
        p: 4,
        textAlign: 'center'
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            {t.back}
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t.selectSaveLocation || 'Select Save Location'}
          </Typography>
          <Box sx={{ width: 80 }} /> {/* Spacer for centering */}
        </Box>

        {/* Icon */}
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            mb: 3,
            mx: 'auto'
          }}
        >
          <LocationOnIcon sx={{ fontSize: 48 }} />
        </Avatar>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t.saveLocationDescription || 'Choose where to save the video file. You can select a folder or enter a custom path.'}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Video Info */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t.videoTitle || 'Video Title'}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {videoInfo.title}
          </Typography>
        </Paper>

        {/* Current Download Directory */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t.currentSaveLocation || 'Current Save Location'}
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-all', fontFamily: 'monospace', mb: 2 }}>
            {downloadDir}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={handleSelectDirectory}
            disabled={isSelecting}
            fullWidth
          >
            {isSelecting ? (t.selecting || 'Selecting...') : (t.selectFolder || 'Select Folder')}
          </Button>
        </Paper>

        {/* Custom Path Input */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t.orEnterCustomPath || 'Or Enter Custom Path'}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="C:/Users/YourName/Videos"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <EditIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          {customPath.trim() && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleUseCustomPath}
              fullWidth
            >
              {t.useThisPath || 'Use This Path'}
            </Button>
          )}
        </Paper>

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              fullWidth
              sx={{ py: 2 }}
            >
              {t.back}
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleConfirm}
              fullWidth
              sx={{ py: 2, fontSize: '1rem' }}
            >
              {t.startDownload || 'Start Download'}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default SavePathScreen;
