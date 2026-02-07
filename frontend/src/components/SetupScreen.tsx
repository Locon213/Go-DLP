import React from 'react';
import { Box, Typography, CircularProgress, LinearProgress } from '@mui/material';
import { useLanguage } from '../i18n/LanguageContext';

interface SetupScreenProps {
  setupProgress: number;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ setupProgress }) => {
  const { t } = useLanguage();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <CircularProgress size={80} sx={{ mb: 4, color: 'primary.main' }} />
      <Typography variant="h4" sx={{ mb: 2, color: 'primary.light' }}>{t.settingUpComponents}</Typography>
      <LinearProgress
        variant="determinate"
        value={setupProgress}
        sx={{ width: '100%', maxWidth: 800, height: 8, borderRadius: 4, mb: 2 }}
      />
      <Typography variant="body1" fontFamily="monospace" sx={{ mt: 2, color: 'text.secondary' }}>
        {t.percentComplete.replace('%', setupProgress.toString())}
      </Typography>
    </Box>
  );
};

export default SetupScreen;