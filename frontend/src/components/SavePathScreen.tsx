import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Grid, Paper, Avatar, TextField, Divider, alpha, CircularProgress } from '@mui/material';
import {
  FolderOpen as FolderOpenIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  LocationOn as LocationOnIcon,
  Edit as EditIcon,
  VideoFile as VideoFileIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { VideoInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
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
  const { themeStyles, themeStyle, darkMode } = useTheme();
  const themeConfig = themeStyles[themeStyle];
  
  const [downloadDir, setDownloadDir] = useState<string>('');
  const [customPath, setCustomPath] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

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

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 800,
          width: '100%',
          p: 4,
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              borderRadius: 3,
              '&:hover': {
                bgcolor: alpha(themeConfig.primary, 0.08),
              },
            }}
          >
            {t.back}
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.secondary} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t.savePathScreenTitle}
          </Typography>
          <Box sx={{ width: 80 }} /> {/* Spacer for centering */}
        </Box>

        {/* Icon */}
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: alpha(themeConfig.primary, 0.15),
              border: '2px solid',
              borderColor: themeConfig.primary,
            }}
          >
            <LocationOnIcon sx={{ fontSize: 40, color: themeConfig.primary }} />
          </Avatar>
        </Box>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          {t.savePathScreenDescription}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Video Info */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: alpha(darkMode ? '#fff' : '#000', 0.03),
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <VideoFileIcon sx={{ color: themeConfig.primary, fontSize: 20 }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t.savePathScreenVideoTitle}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500, textAlign: 'left' }}>
            {videoInfo.title}
          </Typography>
        </Paper>

        {/* Current Download Directory */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: alpha(themeConfig.primary, 0.05),
            border: '1px solid',
            borderColor: alpha(themeConfig.primary, 0.2),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOnIcon sx={{ color: themeConfig.primary, fontSize: 20 }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t.savePathScreenCurrentSaveLocation}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              mb: 2,
              textAlign: 'left',
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(darkMode ? '#fff' : '#000', 0.05),
            }}
          >
            {downloadDir}
          </Typography>
          <Button
            variant="outlined"
            startIcon={isSelecting ? <CircularProgress size={20} /> : <FolderOpenIcon />}
            onClick={handleSelectDirectory}
            disabled={isSelecting}
            fullWidth
            sx={{
              borderRadius: 3,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {isSelecting ? t.selecting : t.selectFolder}
          </Button>
        </Paper>

        {/* Custom Path Input */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            bgcolor: alpha(darkMode ? '#fff' : '#000', 0.03),
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EditIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="subtitle2" color="text.secondary">
              {t.savePathScreenOrEnterCustomPath}
            </Typography>
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="C:/Users/YourName/Videos"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
          {customPath.trim() && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CheckCircleIcon />}
              onClick={handleUseCustomPath}
              fullWidth
              sx={{
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {t.savePathScreenUseThisPath}
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
              sx={{
                py: 2,
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {t.back}
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="contained"
              startIcon={isConfirming ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <DownloadIcon />}
              onClick={handleConfirm}
              disabled={isConfirming}
              fullWidth
              sx={{
                py: 2,
                fontSize: '1rem',
                borderRadius: 3,
              }}
            >
              {t.savePathScreenStartDownload}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default SavePathScreen;
