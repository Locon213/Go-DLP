import React from 'react';
import { Box, Card, Typography, TextField, Button, Grid, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { ContentCopy as ContentCopyIcon, Visibility as VisibilityIcon, CloudDownload as CloudDownloadIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';

interface InputScreenProps {
  url: string;
  setUrl: (url: string) => void;
  isAnalyzing: boolean;
  handleAnalyze: () => void;
  handleAnalyzeAndDownloadFast: () => void;
}

const InputScreen: React.FC<InputScreenProps> = ({
  url,
  setUrl,
  isAnalyzing,
  handleAnalyze,
  handleAnalyzeAndDownloadFast
}) => {
  const { t } = useLanguage();

  return (
    <Box sx={{ spacing: 4, pb: 4 }}>
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{
          background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          {t.downloadMedia}
        </Typography>

        <Box sx={{ spacing: 3 }}>
          <TextField
            fullWidth
            label={t.enterUrl}
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.urlPlaceholder}
            disabled={isAnalyzing}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={async () => {
                      try {
                        const clipboardText = await navigator.clipboard.readText();
                        setUrl(clipboardText);
                      } catch (err) {
                        console.error('Failed to read clipboard contents: ', err);
                      }
                    }}
                    edge="end"
                    title="Paste from clipboard"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={!url.trim() || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <VisibilityIcon />}
                sx={{ py: 1.5, fontSize: '1.2rem' }}
              >
                {isAnalyzing ? t.analyzing : t.analyze}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleAnalyzeAndDownloadFast}
                disabled={!url.trim() || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                sx={{ py: 1.5, fontSize: '1.2rem' }}
              >
                {isAnalyzing ? t.analyzing : t.analyzeAndDownload}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h1" sx={{ mb: 2 }}>🚀</Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>{t.featuresLightningFast}</Typography>
            <Typography variant="body2" color="text.secondary">{t.featuresLightningFastDesc}</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h1" sx={{ mb: 2 }}>🔒</Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>{t.featuresSecurePrivate}</Typography>
            <Typography variant="body2" color="text.secondary">{t.featuresSecurePrivateDesc}</Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
            <Typography variant="h1" sx={{ mb: 2 }}>💎</Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>{t.featuresHighQuality}</Typography>
            <Typography variant="body2" color="text.secondary">{t.featuresHighQualityDesc}</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Supported Platforms */}
      <Typography variant="body2" align="center" sx={{ pt: 3, color: 'text.secondary' }}>
        {t.supportedPlatforms}
      </Typography>
    </Box>
  );
};

export default InputScreen;