import React, { useState } from 'react';
import { Box, Card, Typography, Button, Grid, Paper, Avatar, LinearProgress, MenuItem, Select, SelectChangeEvent, FormControl, InputLabel, Divider } from '@mui/material';
import {
  Transform as TransformIcon,
  VideoFile as VideoFileIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';

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
  const [targetFormat, setTargetFormat] = useState<string>('mp4');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const videoFormats = [
    { value: 'mp4', label: 'MP4' },
    { value: 'webm', label: 'WebM' },
    { value: 'mkv', label: 'MKV' },
    { value: 'avi', label: 'AVI' },
    { value: 'mov', label: 'MOV' },
    { value: 'flv', label: 'FLV' },
    { value: 'wmv', label: 'WMV' },
    { value: 'm4v', label: 'M4V' },
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
      // Симуляция прогресса конвертации
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
            onClick={handleBack}
            disabled={isConverting}
          >
            {t.back}
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t.convertTitle}
          </Typography>
          <Box sx={{ width: 80 }} /> {/* Spacer for centering */}
        </Box>

        {/* Icon */}
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: conversionStatus === 'success' ? 'success.main' :
                     conversionStatus === 'error' ? 'error.main' : 'primary.main',
            mb: 3,
            mx: 'auto'
          }}
        >
          {conversionStatus === 'success' ? (
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          ) : conversionStatus === 'error' ? (
            <ErrorIcon sx={{ fontSize: 48 }} />
          ) : (
            <TransformIcon sx={{ fontSize: 48 }} />
          )}
        </Avatar>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t.convertDescription}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Source File */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoFileIcon />
            {t.sourceFile}
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {sourceFile}
          </Typography>
        </Paper>

        {/* Format Selection */}
        {conversionStatus === 'idle' && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>{t.targetFormat}</InputLabel>
            <Select
              value={targetFormat}
              label={t.targetFormat}
              onChange={handleFormatChange}
              disabled={isConverting}
            >
              {videoFormats.map((format) => (
                <MenuItem key={format.value} value={format.value}>
                  {format.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Progress Bar */}
        {conversionStatus === 'converting' && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{t.convertingVideo}</Typography>
              <Typography variant="body2">{conversionProgress.toFixed(0)}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={conversionProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Success Message */}
        {conversionStatus === 'success' && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'success.main', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: 'success.contrastText' }}>
              {t.conversionComplete}
            </Typography>
          </Box>
        )}

        {/* Error Message */}
        {conversionStatus === 'error' && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.main', borderRadius: 2 }}>
            <Typography variant="body1" sx={{ color: 'error.contrastText' }}>
              {errorMessage}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Grid container spacing={2}>
          {conversionStatus === 'idle' && (
            <>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<TransformIcon />}
                  onClick={handleConvert}
                  fullWidth
                  sx={{ py: 2, fontSize: '1rem' }}
                >
                  {t.convertButton}
                </Button>
              </Grid>
            </>
          )}
          {conversionStatus === 'success' && (
            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleBack}
                fullWidth
                sx={{ py: 2, fontSize: '1rem' }}
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
                  color="primary"
                  onClick={handleBack}
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
                  startIcon={<TransformIcon />}
                  onClick={handleConvert}
                  fullWidth
                  sx={{ py: 2 }}
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
