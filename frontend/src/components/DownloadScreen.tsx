import React from 'react';
import { Box, Card, Typography, LinearProgress, Grid, Paper, Avatar, Button } from '@mui/material';
import { Download as DownloadIcon, Schedule as ScheduleIcon, Speed as SpeedIcon, Storage as StorageIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { VideoInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface DownloadScreenProps {
  videoInfo: VideoInfo | null;
  downloadProgress: number;
  downloadSize: string;
  downloadSpeed: string;
  downloadEta: string;
  onCancelDownload: () => void;
}

const DownloadScreen: React.FC<DownloadScreenProps> = ({
  videoInfo,
  downloadProgress,
  downloadSize,
  downloadSpeed,
  downloadEta,
  onCancelDownload
}) => {
  const { t } = useLanguage();
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
        <Typography variant="h4" gutterBottom>
          {t.downloading}
        </Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3
        }}>
          <Avatar
            sx={{
              width: 128,
              height: 128,
              bgcolor: 'primary.main',
              mb: 2
            }}
          >
            <DownloadIcon sx={{ fontSize: 64 }} />
          </Avatar>

          <Typography variant="h6" noWrap sx={{ maxWidth: '100%' }}>
            {videoInfo?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t.downloadScreenUploader}: {videoInfo?.uploader || t.unknown}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{t.downloadProgress}</Typography>
            <Typography variant="body2">{downloadProgress.toFixed(1)}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={downloadProgress}
            sx={{ height: 8, borderRadius: 4, mb: 3 }}
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 4 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption" display="block">{t.timeLeft}</Typography>
                <Typography variant="body2">{downloadEta}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <SpeedIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption" display="block">{t.speed}</Typography>
                <Typography variant="body2">{downloadSpeed}</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <StorageIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="caption" display="block">{t.fileSize}</Typography>
                <Typography variant="body2">{downloadSize}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Button
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          onClick={onCancelDownload}
          sx={{ width: '100%' }}
        >
          {t.cancelDownload}
        </Button>
      </Card>
    </Box>
  );
};

export default DownloadScreen;