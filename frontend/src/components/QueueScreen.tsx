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
  Button
} from '@mui/material';
import { Cancel as CancelIcon, Download as DownloadIcon, Done as DoneIcon, FolderOpen as FolderOpenIcon, Transform as ConvertIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';

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

  // Group items by status
  const pendingItems = queueItems.filter(item => item.status === 'pending');
  const inProgressItems = queueItems.filter(item => item.status === 'in-progress');
  const completedItems = queueItems.filter(item => item.status === 'completed' || item.status === 'failed' || item.status === 'cancelled');

  return (
    <Box sx={{ pb: 4 }}>
      <Card sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{
            background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            {t.downloadQueue}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={onGoToHome}
          >
            {t.goToHome || 'Go to Home'}
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph align="center">
          {t.queueDescription}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Chip 
              label={`${t.pending}: ${pendingItems.length}`} 
              color="default"
              variant="outlined"
              sx={{ width: '100%', py: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Chip 
              label={`${t.inProgress}: ${inProgressItems.length}`} 
              color="primary"
              variant="outlined"
              sx={{ width: '100%', py: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Chip 
              label={`${t.completed}: ${completedItems.length}`} 
              color="secondary"
              variant="outlined"
              sx={{ width: '100%', py: 1 }}
            />
          </Grid>
        </Grid>

        {queueItems.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ py: 4 }}>
            {t.noDownloadsInQueue}
          </Typography>
        ) : (
          <>
            {inProgressItems.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  {t.currentDownloads}
                </Typography>
                <List>
                  {inProgressItems.map((item) => (
                    <ListItem key={item.id} divider sx={{ p: 2 }}>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {item.status === 'in-progress' ? t.downloading : t.completed}
                              </Typography>
                              <Chip 
                                label={`${Math.round(item.progress)}%`} 
                                size="small" 
                                color="primary" 
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {/* [FIX] Показываем speed, или плейсхолдер если статус активен, но данных нет */}
                              {(item.speed || item.status === 'in-progress') && (
                                <Typography variant="caption" color="text.secondary">
                                  {t.speed}: {item.speed || 'Calculating...'}
                                </Typography>
                              )}

                              {(item.size || item.status === 'in-progress') && (
                                <Typography variant="caption" color="text.secondary">
                                  {t.fileSize}: {item.size || 'Calculating...'}
                                </Typography>
                              )}

                              {(item.eta || item.status === 'in-progress') && (
                                <Typography variant="caption" color="text.secondary">
                                  {t.timeLeft}: {item.eta || 'Calculating...'}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <LinearProgress 
                        variant="determinate" 
                        value={item.progress} 
                        sx={{ width: '60%', mr: 2 }} 
                      />
                      <IconButton 
                        onClick={() => onCancelDownload(item.id)}
                        color="error"
                        size="small"
                      >
                        <CancelIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {pendingItems.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'info.main' }}>
                  {t.pendingDownloads}
                </Typography>
                <List>
                  {pendingItems.map((item) => (
                    <ListItem key={item.id} divider sx={{ p: 2 }}>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t.waitingToDownload}
                            </Typography>
                            <Chip 
                              label={t.pending} 
                              size="small" 
                              color="default" 
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                      <DownloadIcon color="disabled" sx={{ mr: 2 }} />
                      <IconButton 
                        onClick={() => onCancelDownload(item.id)}
                        color="error"
                        size="small"
                      >
                        <CancelIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {completedItems.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                    {t.completedDownloads}
                  </Typography>
                  <IconButton 
                    onClick={onClearCompleted}
                    color="secondary"
                    size="small"
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
                <List>
                  {completedItems.map((item) => (
                    <ListItem key={item.id} divider sx={{ p: 2 }}>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {item.status === 'completed'
                                ? t.completedSuccessfully
                                : item.status === 'failed'
                                  ? t.failed
                                  : t.cancelled}
                            </Typography>
                            <Chip
                              label={item.status === 'completed'
                                ? t.completed
                                : item.status === 'failed'
                                  ? t.failed
                                  : t.cancelled}
                              size="small"
                              color={item.status === 'completed'
                                ? 'success'
                                : item.status === 'failed'
                                  ? 'error'
                                  : 'default'}
                            />
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {item.status === 'completed' && item.outputPath && (
                          <>
                            {onOpenInExplorer && (
                              <IconButton
                                onClick={() => onOpenInExplorer(item.outputPath!)}
                                color="primary"
                                size="small"
                                title={t.openInExplorer}
                              >
                                <FolderOpenIcon />
                              </IconButton>
                            )}
                            {onConvertVideo && (
                              <IconButton
                                onClick={() => onConvertVideo(item.outputPath!)}
                                color="secondary"
                                size="small"
                                title={t.convertVideo}
                              >
                                <ConvertIcon />
                              </IconButton>
                            )}
                          </>
                        )}
                        <DoneIcon color={item.status === 'completed' ? 'success' : 'disabled'} />
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