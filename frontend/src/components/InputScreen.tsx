import React from 'react';
import { Box, Card, Typography, TextField, Button, Grid, InputAdornment, IconButton, CircularProgress, Paper } from '@mui/material';
import { ContentCopy as ContentCopyIcon, Visibility as VisibilityIcon, CloudDownload as CloudDownloadIcon, PlayCircle as PlayCircleIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

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
  const { themeStyles, themeStyle } = useTheme();

  return (
    <Box sx={{ pb: 4 }}>
      {/* Main Input Card */}
      <Card
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%)',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary} 0%, ${themeStyles[themeStyle].secondary} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
            mb: 3,
          }}
        >
          {t.downloadMedia}
        </Typography>

        <Box>
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
                    title={t.pasteFromClipboard}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                },
                '&.Mui-focused': {
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                },
              },
            }}
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleAnalyze}
                disabled={!url.trim() || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <VisibilityIcon />}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                {isAnalyzing ? t.analyzing : t.analyze}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAnalyzeAndDownloadFast}
                disabled={!url.trim() || isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
                }}
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
          <Card
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary}20 0%, ${themeStyles[themeStyle].secondary}20 100%)`,
              }}
            >
              <Typography variant="h3">{'\u{1F680}'}</Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t.featuresLightningFast}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.featuresLightningFastDesc}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary}20 0%, ${themeStyles[themeStyle].secondary}20 100%)`,
              }}
            >
              <Typography variant="h3">{'\u{1F512}'}</Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t.featuresSecurePrivate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.featuresSecurePrivateDesc}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${themeStyles[themeStyle].primary}20 0%, ${themeStyles[themeStyle].secondary}20 100%)`,
              }}
            >
              <Typography variant="h3">{'\u{1F48E}'}</Typography>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t.featuresHighQuality}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.featuresHighQualityDesc}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Supported Platforms */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 2,
          borderRadius: 3,
          textAlign: 'center',
          bgcolor: 'transparent',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <PlayCircleIcon sx={{ fontSize: 18, opacity: 0.6 }} />
          {t.supportedPlatforms}
        </Typography>
      </Paper>
    </Box>
  );
};

export default InputScreen;
