import React from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip,
  IconButton,
  Grid,
  Button,
  Paper,
  alpha,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Done as DoneIcon,
  FolderOpen as FolderOpenIcon,
  Transform as ConvertIcon,
  Home as HomeIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface QueueItem {
  id: string;
  url: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  priority: 'low' | 'normal' | 'high';
  addedAt: Date;
  speed?: string;
  size?: string;
  eta?: string;
  outputPath?: string;
}

interface QueueScreenProps {
  queueItems: QueueItem[];
  onCancelDownload: (id: string) => void;
  onClearCompleted: () => void;
  onGoToHome: () => void;
  onOpenInExplorer?: (path: string) => void;
  onConvertVideo?: (path: string) => void;
}

const QueueScreen: React.FC<QueueScreenProps> = React.memo(({
  queueItems,
  onCancelDownload,
  onClearCompleted,
  onGoToHome,
  onOpenInExplorer,
  onConvertVideo
}) => {
  const { t } = useLanguage();
  const { themeStyles, themeStyle, darkMode } = useTheme();
  const themeConfig = themeStyles[themeStyle];

  // Group items by status
  const pendingItems = queueItems.filter(item => item.status === 'pending');
  const inProgressItems = queueItems.filter(item => item.status === 'in-progress');
  const completedItems = queueItems.filter(item => item.status === 'completed' || item.status === 'failed' || item.status === 'cancelled');

  // Status chip style helper
  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: string; bgcolor: string; label: string }> = {
      pending: { color: '#757575', bgcolor: alpha('#757575', 0.15), label: t.pending },
      'in-progress': { color: themeConfig.primary, bgcolor: alpha(themeConfig.primary, 0.15), label: t.inProgress },
      completed: { color: '#4caf50', bgcolor: alpha('#4caf50', 0.15), label: t.completed },
      failed: { color: '#f44336', bgcolor: alpha('#f44336', 0.15), label: t.failed },
      cancelled: { color: '#ff9800', bgcolor: alpha('#ff9800', 0.15), label: t.cancelled },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgcolor,
          color: config.color,
          fontWeight: 500,
          borderRadius: 2,
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
              background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.secondary} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600,
            }}
          >
            {t.downloadQueue}
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
          {t.queueDescriptionText}
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
                bgcolor: alpha('#757575', 0.08),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <ScheduleIcon sx={{ fontSize: 28, color: '#757575', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#757575' }}>
                {pendingItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.pending}
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
                bgcolor: alpha(themeConfig.primary, 0.08),
                border: '1px solid',
                borderColor: alpha(themeConfig.primary, 0.3),
              }}
            >
              <DownloadIcon sx={{ fontSize: 28, color: themeConfig.primary, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: themeConfig.primary }}>
                {inProgressItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.inProgress}
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
                bgcolor: alpha('#4caf50', 0.08),
                border: '1px solid',
                borderColor: alpha('#4caf50', 0.3),
              }}
            >
              <DoneIcon sx={{ fontSize: 28, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#4caf50' }}>
                {completedItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.completed}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {queueItems.length === 0 ? (
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
            <DownloadIcon
              sx={{
                fontSize: 64,
                color: 'text.disabled',
                mb: 2,
              }}
            />
            <Typography variant="h6" color="text.secondary">
              {t.noDownloadsInQueue}
            </Typography>
          </Paper>
        ) : (
          <>
            {/* In Progress Items */}
            {inProgressItems.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: themeConfig.primary,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <DownloadIcon />
                  {t.currentDownloads}
                </Typography>
                <List sx={{ p: 0 }}>
                  {inProgressItems.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        mb: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha(themeConfig.primary, 0.3),
                        bgcolor: alpha(themeConfig.primary, 0.05),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(themeConfig.primary, 0.08),
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            {/* Progress Bar */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={item.progress}
                                sx={{
                                  flex: 1,
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha(themeConfig.primary, 0.15),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, ${themeConfig.primary} 0%, ${themeConfig.accent} 100%)`,
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: themeConfig.primary,
                                  minWidth: 50,
                                  textAlign: 'right',
                                }}
                              >
                                {Math.round(item.progress)}%
                              </Typography>
                            </Box>
                            {/* Stats */}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {item.speed && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {item.speed}
                                  </Typography>
                                </Box>
                              )}
                              {item.size && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <StorageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {item.size}
                                  </Typography>
                                </Box>
                              )}
                              {item.eta && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {item.eta}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <IconButton
                        onClick={() => onCancelDownload(item.id)}
                        sx={{
                          borderRadius: 2,
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: alpha('#f44336', 0.1),
                          },
                        }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: '#757575',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <ScheduleIcon />
                  {t.pendingDownloads}
                </Typography>
                <List sx={{ p: 0 }}>
                  {pendingItems.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        mb: 1.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(darkMode ? '#fff' : '#000', 0.03),
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t.waitingToDownload}
                            </Typography>
                            {getStatusChip(item.status)}
                          </Box>
                        }
                      />
                      <DownloadIcon color="disabled" sx={{ mr: 1 }} />
                      <IconButton
                        onClick={() => onCancelDownload(item.id)}
                        sx={{
                          borderRadius: 2,
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: alpha('#f44336', 0.1),
                          },
                        }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Completed Items */}
            {completedItems.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#4caf50',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <DoneIcon />
                    {t.completedDownloads}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearAllIcon />}
                    onClick={onClearCompleted}
                    sx={{
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 },
                    }}
                  >
                    {t.clearQueue}
                  </Button>
                </Box>
                <List sx={{ p: 0 }}>
                  {completedItems.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        mb: 1.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: item.status === 'completed' ? alpha('#4caf50', 0.3) : 'divider',
                        bgcolor: item.status === 'completed' ? alpha('#4caf50', 0.05) : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: item.status === 'completed' ? alpha('#4caf50', 0.08) : alpha(darkMode ? '#fff' : '#000', 0.03),
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {item.status === 'completed'
                                ? t.completedSuccessfully
                                : item.status === 'failed'
                                  ? t.failed
                                  : t.cancelled}
                            </Typography>
                            {getStatusChip(item.status)}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {item.status === 'completed' && item.outputPath && (
                          <>
                            {onOpenInExplorer && (
                              <IconButton
                                onClick={() => onOpenInExplorer(item.outputPath!)}
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
                            {onConvertVideo && (
                              <IconButton
                                onClick={() => onConvertVideo(item.outputPath!)}
                                sx={{
                                  borderRadius: 2,
                                  color: themeConfig.secondary,
                                  '&:hover': {
                                    bgcolor: alpha(themeConfig.secondary, 0.1),
                                  },
                                }}
                                title={t.convertVideo}
                              >
                                <ConvertIcon />
                              </IconButton>
                            )}
                          </>
                        )}
                        <DoneIcon
                          sx={{
                            color: item.status === 'completed' ? '#4caf50' : 'text.disabled',
                            alignSelf: 'center',
                          }}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
      </Card>
    </Box>
  );
});

export default QueueScreen;