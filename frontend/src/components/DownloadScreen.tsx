import React from 'react';
import { Box, Card, Typography, LinearProgress, Grid, Paper, Avatar, Button, alpha } from '@mui/material';
import { Schedule as ScheduleIcon, Speed as SpeedIcon, Storage as StorageIcon, Cancel as CancelIcon, CloudDownload as CloudDownloadIcon } from '@mui/icons-material';
import { VideoInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

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
  const { themeStyles, themeStyle, darkMode } = useTheme();
  const themeConfig = themeStyles[themeStyle];

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
        {/* Animated Download Icon */}
        <Box
          sx={{
            position: 'relative',
            display: 'inline-flex',
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: alpha(themeConfig.primary, 0.15),
              border: '3px solid',
              borderColor: themeConfig.primary,
            }}
          >
            <CloudDownloadIcon
              sx={{
                fontSize: 48,
                color: themeConfig.primary,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.8,
                  },
                },
              }}
            />
          </Avatar>
          {/* Progress Ring */}
          <Box
            sx={{
              position: 'absolute',
              top: -3,
              left: -3,
              right: -3,
              bottom: -3,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: themeConfig.accent,
              animation: 'spin 1.5s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>

        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.secondary} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t.downloading}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              maxWidth: '100%',
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            {videoInfo?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t.downloadScreenUploader}: {videoInfo?.uploader || t.unknown}
          </Typography>
        </Box>

        {/* Progress Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 500 }}
            >
              {t.downloadProgress}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: themeConfig.primary,
              }}
            >
              {downloadProgress.toFixed(1)}%
            </Typography>
          </Box>
          
          <Box sx={{ position: 'relative', mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={downloadProgress}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: alpha(themeConfig.primary, 0.15),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${themeConfig.primary} 0%, ${themeConfig.accent} 100%)`,
                },
              }}
            />
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: alpha(darkMode ? '#fff' : '#000', 0.03),
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(darkMode ? '#fff' : '#000', 0.05),
                  },
                }}
              >
                <ScheduleIcon
                  sx={{
                    fontSize: 28,
                    mb: 1,
                    color: themeConfig.primary,
                  }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {t.timeLeft}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600 }}
                >
                  {downloadEta}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: alpha(darkMode ? '#fff' : '#000', 0.03),
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(darkMode ? '#fff' : '#000', 0.05),
                  },
                }}
              >
                <SpeedIcon
                  sx={{
                    fontSize: 28,
                    mb: 1,
                    color: themeConfig.secondary,
                  }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {t.speed}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600 }}
                >
                  {downloadSpeed}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: alpha(darkMode ? '#fff' : '#000', 0.03),
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(darkMode ? '#fff' : '#000', 0.05),
                  },
                }}
              >
                <StorageIcon
                  sx={{
                    fontSize: 28,
                    mb: 1,
                    color: themeConfig.accent,
                  }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {t.fileSize}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600 }}
                >
                  {downloadSize}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Cancel Button */}
        <Button
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          onClick={onCancelDownload}
          sx={{
            width: '100%',
            borderRadius: 3,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          }}
        >
          {t.cancelDownload}
        </Button>
      </Card>
    </Box>
  );
};

export default DownloadScreen;