import React from 'react';
import { Box, Typography, CircularProgress, LinearProgress, Paper, alpha, Card } from '@mui/material';
import { SettingsSuggest as SetupIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface SetupScreenProps {
  setupProgress: number;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ setupProgress }) => {
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
      }}
    >
      <Card
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          maxWidth: 500,
          width: '100%',
        }}
      >
        {/* Animated Progress Circle */}
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
          <CircularProgress
            size={100}
            thickness={4}
            variant="determinate"
            value={setupProgress}
            sx={{
              color: themeConfig.primary,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SetupIcon
              sx={{
                fontSize: 40,
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
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.secondary} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t.settingUpComponents}
        </Typography>

        {/* Progress Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: alpha(darkMode ? '#fff' : '#000', 0.03),
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t.downloadProgress}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: themeConfig.primary,
              }}
            >
              {setupProgress.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={setupProgress}
            sx={{
              width: '100%',
              height: 12,
              borderRadius: 6,
              bgcolor: alpha(themeConfig.primary, 0.15),
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: `linear-gradient(90deg, ${themeConfig.primary} 0%, ${themeConfig.accent} 100%)`,
              },
            }}
          />
        </Paper>

        {/* Percentage Text */}
        <Typography
          variant="body1"
          fontFamily="monospace"
          sx={{
            mt: 3,
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {setupProgress.toFixed(1)}{t.percentComplete.replace('%', '')}
        </Typography>
      </Card>
    </Box>
  );
};

export default SetupScreen;