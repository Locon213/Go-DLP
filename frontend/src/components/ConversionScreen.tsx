import React, { useState } from 'react';
import { Box, Card, Typography, Button, Grid, Paper, Avatar, LinearProgress, MenuItem, Select, SelectChangeEvent, FormControl, InputLabel, Divider, alpha } from '@mui/material';
import {
  Transform as TransformIcon,
  VideoFile as VideoFileIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Autorenew as AutorenewIcon,
} from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface ConversionScreenProps {
  sourceFile: string;
  onBack: () => void;
  onConvert: (targetFormat: string) => Promise<void>;
}

const ConversionScreen: React.FC<ConversionScreenProps> = ({
  sourceFile,
  onBack,
  onConvert
}) => {
  const { t } = useLanguage();
  const { themeStyles, themeStyle, darkMode } = useTheme();
  const themeConfig = themeStyles[themeStyle];
  
  const [targetFormat, setTargetFormat] = useState<string>('mp4');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const videoFormats = [
    { value: 'mp4', label: 'MP4', description: 'Universal format' },
    { value: 'webm', label: 'WebM', description: 'Web optimized' },
    { value: 'mkv', label: 'MKV', description: 'High quality' },
    { value: 'avi', label: 'AVI', description: 'Legacy format' },
    { value: 'mov', label: 'MOV', description: 'Apple devices' },
    { value: 'flv', label: 'FLV', description: 'Flash video' },
    { value: 'wmv', label: 'WMV', description: 'Windows format' },
    { value: 'm4v', label: 'M4V', description: 'iTunes format' },
  ];

  const handleFormatChange = (event: SelectChangeEvent) => {
    setTargetFormat(event.target.value as string);
  };

  const handleConvert = async () => {
    if (isConverting) return;

    setIsConverting(true);
    setConversionProgress(0);
    setConversionStatus('converting');
    setErrorMessage('');

    try {
      // Simulate conversion progress
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 5;
        });
      }, 500);

      await onConvert(targetFormat);

      clearInterval(progressInterval);
      setConversionProgress(100);
      setConversionStatus('success');
    } catch (error) {
      setConversionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t.conversionError);
    } finally {
      setIsConverting(false);
    }
  };

  const handleBack = () => {
    if (!isConverting) {
      onBack();
    }
  };

  // Get status icon and color
  const getStatusConfig = () => {
    switch (conversionStatus) {
      case 'success':
        return { icon: <CheckCircleIcon sx={{ fontSize: 40 }} />, color: '#4caf50', bgcolor: alpha('#4caf50', 0.15) };
      case 'error':
        return { icon: <ErrorIcon sx={{ fontSize: 40 }} />, color: '#f44336', bgcolor: alpha('#f44336', 0.15) };
      default:
        return { icon: <TransformIcon sx={{ fontSize: 40 }} />, color: themeConfig.primary, bgcolor: alpha(themeConfig.primary, 0.15) };
    }
  };

  const statusConfig = getStatusConfig();

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
            onClick={handleBack}
            disabled={isConverting}
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
            {t.convertTitle}
          </Typography>
          <Box sx={{ width: 80 }} /> {/* Spacer for centering */}
        </Box>

        {/* Icon */}
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: statusConfig.bgcolor,
              border: '2px solid',
              borderColor: statusConfig.color,
            }}
          >
            {statusConfig.icon}
          </Avatar>
          {conversionStatus === 'converting' && (
            <Box
              sx={{
                position: 'absolute',
                top: -3,
                left: -3,
                right: -3,
                bottom: -3,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: themeConfig.accent,
                animation: 'spin 1.5s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          )}
        </Box>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          {t.convertDescription}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Source File */}
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
              {t.sourceFile}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              textAlign: 'left',
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(darkMode ? '#fff' : '#000', 0.05),
            }}
          >
            {sourceFile}
          </Typography>
        </Paper>

        {/* Format Selection */}
        {conversionStatus === 'idle' && (
          <FormControl
            fullWidth
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          >
            <InputLabel>{t.targetFormat}</InputLabel>
            <Select
              value={targetFormat}
              label={t.targetFormat}
              onChange={handleFormatChange}
              disabled={isConverting}
            >
              {videoFormats.map((format) => (
                <MenuItem key={format.value} value={format.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="body1">{format.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                      {format.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Progress Bar */}
        {conversionStatus === 'converting' && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {t.convertingVideo}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: themeConfig.primary,
                }}
              >
                {conversionProgress.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={conversionProgress}
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
        )}

        {/* Success Message */}
        {conversionStatus === 'success' && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
              bgcolor: alpha('#4caf50', 0.15),
              border: '1px solid',
              borderColor: alpha('#4caf50', 0.3),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#4caf50' }} />
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 500 }}>
                {t.conversionComplete}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Error Message */}
        {conversionStatus === 'error' && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 3,
              bgcolor: alpha('#f44336', 0.15),
              border: '1px solid',
              borderColor: alpha('#f44336', 0.3),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <ErrorIcon sx={{ color: '#f44336' }} />
              <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 500 }}>
                {t.conversionError}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#f44336' }}>
              {errorMessage}
            </Typography>
          </Paper>
        )}

        {/* Action Buttons */}
        <Grid container spacing={2}>
          {conversionStatus === 'idle' && (
            <Grid size={{ xs: 12 }}>
              <Button
                variant="contained"
                startIcon={<AutorenewIcon />}
                onClick={handleConvert}
                fullWidth
                sx={{
                  py: 2,
                  fontSize: '1rem',
                  borderRadius: 3,
                }}
              >
                {t.convertButton}
              </Button>
            </Grid>
          )}
          {conversionStatus === 'success' && (
            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                fullWidth
                sx={{
                  py: 2,
                  fontSize: '1rem',
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 },
                }}
              >
                {t.done}
              </Button>
            </Grid>
          )}
          {conversionStatus === 'error' && (
            <>
              <Grid size={{ xs: 6 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
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
                  startIcon={<AutorenewIcon />}
                  onClick={handleConvert}
                  fullWidth
                  sx={{
                    py: 2,
                    borderRadius: 3,
                  }}
                >
                  {t.convertButton}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Card>
    </Box>
  );
};

export default ConversionScreen;
