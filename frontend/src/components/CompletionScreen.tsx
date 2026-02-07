import React from 'react';
import { Box, Card, Typography, Button, Grid, Paper, Avatar, Divider } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  FolderOpen as FolderOpenIcon,
  Home as HomeIcon,
  VideoFile as VideoFileIcon,
  Autorenew as AutorenewIcon
} from '@mui/icons-material';
import { VideoInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

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
        {/* Success Icon */}
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'success.main',
            mb: 3,
            mx: 'auto'
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60 }} />
        </Avatar>

        {/* Success Message */}
        <Typography variant="h4" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
          {t.downloadComplete}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t.thankYouMessage}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Video Information */}
        {videoInfo && (
          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoFileIcon />
              {videoInfo.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.uploader}: {videoInfo.uploader || 'Unknown'}
            </Typography>
          </Box>
        )}

        {/* Download Path */}
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
            {t.savedTo}
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {downloadPath}
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FolderOpenIcon />}
              onClick={onOpenInExplorer}
              fullWidth
              sx={{ py: 2, fontSize: '1rem' }}
            >
              {t.openInExplorer}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AutorenewIcon />}
              onClick={onConvertVideo}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {t.convertVideo}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              variant="text"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={onGoToHome}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {t.goToHome}
            </Button>
          </Grid>
        </Grid>

        {/* Thank You Message */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.main', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
            {t.thankYou}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default CompletionScreen;
