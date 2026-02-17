import React from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Grid,
  Button,
  Paper,
  alpha,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Home as HomeIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { DownloadHistoryItem } from '../services/downloadHistory';
import { OpenInExplorer } from '../../wailsjs/go/main/App';

interface HistoryScreenProps {
  historyItems: DownloadHistoryItem[];
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onGoToHome: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyItems,
  onDeleteItem,
  onClearHistory,
  onGoToHome
}) => {
  const { t } = useLanguage();
  const { themeStyles, themeStyle, darkMode } = useTheme();
  const themeConfig = themeStyles[themeStyle];

  // Group items by status
  const completedItems = historyItems.filter(item => item.status === 'completed');
  const failedItems = historyItems.filter(item => item.status === 'failed');
  const cancelledItems = historyItems.filter(item => item.status === 'cancelled');

  // Status chip style helper
  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: string; bgcolor: string; label: string; icon: React.ReactNode }> = {
      completed: { color: '#4caf50', bgcolor: alpha('#4caf50', 0.15), label: t.completed, icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
      failed: { color: '#f44336', bgcolor: alpha('#f44336', 0.15), label: t.failed, icon: <ErrorIcon sx={{ fontSize: 16 }} /> },
      cancelled: { color: '#ff9800', bgcolor: alpha('#ff9800', 0.15), label: t.cancelled, icon: <CancelIcon sx={{ fontSize: 16 }} /> },
    };
    const config = statusConfig[status] || statusConfig.cancelled;
    return (
      <Chip
        icon={config.icon as React.ReactElement}
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgcolor,
          color: config.color,
          fontWeight: 500,
          borderRadius: 2,
          '& .MuiChip-icon': { color: config.color },
        }}
      />
    );
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Card
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              background: `linear-gradient(135deg, ${themeConfig.accent} 0%, ${themeConfig.primary} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <HistoryIcon sx={{ color: themeConfig.accent, WebkitTextFillColor: 'initial' }} />
            {t.historyTitle}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={onGoToHome}
            sx={{
              borderRadius: 3,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            {t.goToHome}
          </Button>
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          align="center"
          sx={{ mb: 3 }}
        >
          {t.historyDescriptionText}
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: alpha('#4caf50', 0.08),
                border: '1px solid',
                borderColor: alpha('#4caf50', 0.3),
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 28, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#4caf50' }}>
                {completedItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.completed}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: alpha('#f44336', 0.08),
                border: '1px solid',
                borderColor: alpha('#f44336', 0.3),
              }}
            >
              <ErrorIcon sx={{ fontSize: 28, color: '#f44336', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#f44336' }}>
                {failedItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.failed}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: alpha('#ff9800', 0.08),
                border: '1px solid',
                borderColor: alpha('#ff9800', 0.3),
              }}
            >
              <CancelIcon sx={{ fontSize: 28, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#ff9800' }}>
                {cancelledItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.cancelled}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {historyItems.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              py: 8,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: alpha(darkMode ? '#fff' : '#000', 0.02),
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <HistoryIcon
              sx={{
                fontSize: 64,
                color: 'text.disabled',
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary">
              {t.noHistory}
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Clear History Button */}
            {historyItems.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onClearHistory}
                  sx={{
                    borderRadius: 3,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 },
                  }}
                >
                  {t.clearHistory}
                </Button>
              </Box>
            )}

            {/* History List */}
            <List sx={{ p: 0 }}>
              {historyItems.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    mb: 1.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: item.status === 'completed'
                      ? alpha('#4caf50', 0.3)
                      : item.status === 'failed'
                        ? alpha('#f44336', 0.3)
                        : 'divider',
                    bgcolor: item.status === 'completed'
                      ? alpha('#4caf50', 0.05)
                      : item.status === 'failed'
                        ? alpha('#f44336', 0.05)
                        : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: item.status === 'completed'
                        ? alpha('#4caf50', 0.08)
                        : item.status === 'failed'
                          ? alpha('#f44336', 0.08)
                          : alpha(darkMode ? '#fff' : '#000', 0.03),
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {(item.downloadedAt || item.dateAdded).toLocaleString()}
                        </Typography>
                        {getStatusChip(item.status)}
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {item.status === 'completed' && item.outputPath && (
                      <IconButton
                        onClick={() => {
                          OpenInExplorer(item.outputPath);
                        }}
                        sx={{
                          borderRadius: 2,
                          color: themeConfig.primary,
                          '&:hover': {
                            bgcolor: alpha(themeConfig.primary, 0.1),
                          },
                        }}
                        title={t.openInExplorer}
                      >
                        <FolderOpenIcon />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => onDeleteItem(item.id)}
                      sx={{
                        borderRadius: 2,
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: alpha('#f44336', 0.1),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Card>
    </Box>
  );
};

export default HistoryScreen;
