import React from 'react';
import { Box, Card, Typography, Button, Grid, Paper, Avatar, Divider, alpha } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  FolderOpen as FolderOpenIcon,
  Home as HomeIcon,
  VideoFile as VideoFileIcon,
  Autorenew as AutorenewIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { VideoInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface CompletionScreenProps {
  videoInfo: VideoInfo | null;
  downloadPath: string;
  onOpenInExplorer: () => void;
  onGoToHome: () => void;
  onConvertVideo: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  videoInfo,
  downloadPath,
  onOpenInExplorer,
  onGoToHome,
  onConvertVideo
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
        {/* Success Icon with Animation */}
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: alpha('#4caf50', 0.15),
              border: '3px solid',
              borderColor: '#4caf50',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 50, color: '#4caf50' }} />
          </Avatar>
          {/* Celebration particles */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 150,
              height: 150,
              pointerEvents: 'none',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: i % 2 === 0 ? themeConfig.primary : themeConfig.accent,
                  animation: `particle-${i} 1.5s ease-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                  [`@keyframes particle-${i}`]: {
                    '0%': {
                      transform: 'translate(-50%, -50%) scale(1)',
                      opacity: 1,
                    },
                    '100%': {
                      transform: `translate(${Math.cos(i * 60 * Math.PI / 180) * 60}px, ${Math.sin(i * 60 * Math.PI / 180) * 60}px) scale(0)`,
                      opacity: 0,
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Success Message */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: '#4caf50',
          }}
        >
          {t.downloadComplete}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}
        >
          {t.thankYouMessage}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Video Information */}
        {videoInfo && (
          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
              }}
            >
              <VideoFileIcon sx={{ color: themeConfig.primary }} />
              {t.completionVideoTitle}: {videoInfo.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.completionUploader}: {videoInfo.uploader || t.unknown}
            </Typography>
          </Box>
        )}

        {/* Download Path */}
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
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            {t.savedTo}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              bgcolor: alpha(darkMode ? '#fff' : '#000', 0.05),
              p: 1.5,
              borderRadius: 2,
            }}
          >
            {downloadPath}
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="contained"
              startIcon={<FolderOpenIcon />}
              onClick={onOpenInExplorer}
              fullWidth
              sx={{
                py: 2,
                fontSize: '1rem',
                borderRadius: 3,
              }}
            >
              {t.openInExplorer}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="outlined"
              startIcon={<AutorenewIcon />}
              onClick={onConvertVideo}
              fullWidth
              sx={{
                py: 2,
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {t.convertVideo}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="text"
              startIcon={<HomeIcon />}
              onClick={onGoToHome}
              fullWidth
              sx={{
                py: 2,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: alpha(themeConfig.primary, 0.08),
                },
              }}
            >
              {t.goToHome}
            </Button>
          </Grid>
        </Grid>

        {/* Thank You Banner */}
        <Box
          sx={{
            mt: 4,
            p: 2.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.secondary} 100%)`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CelebrationIcon sx={{ color: 'white' }} />
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: 500 }}
            >
              {t.thankYou}
            </Typography>
            <CelebrationIcon sx={{ color: 'white' }} />
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default CompletionScreen;
