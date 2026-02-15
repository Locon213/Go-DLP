import React from 'react';
import { Box, Card, CardMedia, Grid, Typography, Chip, List, ListItem, ListItemText, Button } from '@mui/material';
import { AccessTime as AccessTimeIcon, Person as PersonIcon, ViewList as ViewListIcon, Storage as StorageIcon, Videocam as VideocamIcon, Audiotrack as AudiotrackIcon, ArrowBack as ArrowBackIcon, Download as DownloadIcon } from '@mui/icons-material';
import { VideoInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface SelectionScreenProps {
  videoInfo: VideoInfo;
  selectedFormat: string;
  setSelectedFormat: (formatId: string) => void;
  setCurrentStep: (step: 'input' | 'selection' | 'savepath') => void;
  isDownloading: boolean;
  formatDuration: (seconds: number) => string;
  formatFileSize: (bytes: number | null | undefined) => string;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({
  videoInfo,
  selectedFormat,
  setSelectedFormat,
  setCurrentStep,
  isDownloading,
  formatDuration,
  formatFileSize
}) => {
  const { t } = useLanguage();

  return (
    <Box sx={{ spacing: 3, pb: 4 }}>
      <Card sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <CardMedia
              component="img"
              image={videoInfo.thumbnail}
              alt={videoInfo.title}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://placehold.co/600x400/1e293b/64748b?text=No+Thumbnail';
              }}
              sx={{
                borderRadius: 2,
                maxHeight: 300,
                objectFit: 'cover',
                width: '100%'
              }}
            />

            <Box sx={{ mt: 3, spacing: 2 }}>
              <Typography variant="h5" component="div" sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {videoInfo.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip
                  icon={<AccessTimeIcon />}
                  label={formatDuration(videoInfo.duration)}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<PersonIcon />}
                  label={videoInfo.uploader || 'Unknown'}
                  variant="outlined"
                  size="small"
                />
              </Box>

              {videoInfo.description && (
                <Box sx={{ mt: 2, maxHeight: 128, overflow: 'auto', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {videoInfo.description}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ViewListIcon sx={{ mr: 1, color: 'primary.main' }} />
              {t.selectFormat}
            </Typography>

            <Box sx={{
              maxHeight: 500,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0,0,0,0.3)',
              }
            }}>
              <List>
                {videoInfo.formats
                  .filter(format => {
                    return (format.resolution || (format.acodec !== 'none' && format.vcodec === 'none')) && format.format_id;
                  })
                  .sort((a, b) => {
                    if (b.resolution && a.resolution) {
                      const [aWidth, aHeight] = a.resolution.split('x').map(Number);
                      const [bWidth, bHeight] = b.resolution.split('x').map(Number);

                      if (bHeight !== aHeight) {
                        return bHeight - aHeight;
                      }

                      if (bWidth !== aWidth) {
                        return bWidth - aWidth;
                      }

                      if (b.filesize && a.filesize) {
                        return Number(b.filesize) - Number(a.filesize);
                      }
                    }

                    if (!a.resolution && b.resolution) return 1;
                    if (a.resolution && !b.resolution) return -1;

                    return 0;
                  })
                  .map((format, index) => (
                    <ListItem
                      key={`${format.format_id}-${index}`}
                      onClick={() => setSelectedFormat(format.format_id)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        border: 1,
                        borderColor: selectedFormat === format.format_id ? 'primary.main' : 'divider',
                        bgcolor: selectedFormat === format.format_id ? 'action.selected' : 'background.paper',
                        '&:hover': {
                          bgcolor: selectedFormat === format.format_id ? 'action.selected' : 'action.hover',
                          cursor: 'pointer',
                        },
                        cursor: 'pointer'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
                              {format.resolution ? (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <VideocamIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                                  {format.resolution}
                                </Box>
                              ) : (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AudiotrackIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                                  AUDIO ONLY
                                </Box>
                              )}
                              <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                {format.ext.toUpperCase()}
                              </Typography>
                            </Typography>
                            {selectedFormat === format.format_id && (
                              <Chip
                                label="Selected"
                                size="small"
                                color="primary"
                                sx={{ ml: 2 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <StorageIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="caption" color="text.secondary">
                              {format.vcodec !== 'none' ? format.vcodec : 'No video'} + {format.acodec !== 'none' ? format.acodec : 'No audio'}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="primary" component="div">
                          {format.filesizeHuman ||
                           (formatFileSize(format.filesize || 0) !== 'Unknown'
                             ? formatFileSize(format.filesize)
                             : (format.filesizeApprox
                               ? (typeof format.filesizeApprox === 'string' 
                                   ? (format.filesizeApprox.includes('iB') || format.filesizeApprox.includes('B') 
                                       ? format.filesizeApprox 
                                       : '~' + formatFileSize(parseInt(format.filesizeApprox)))
                                   : '~' + formatFileSize(format.filesizeApprox))
                               : 'Unknown'))}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => setCurrentStep('input')}
              sx={{ flex: 1 }}
            >
              {t.back}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => setCurrentStep('savepath')}
              disabled={!selectedFormat || isDownloading}
              sx={{ flex: 1 }}
            >
              {isDownloading ? t.downloading : t.download}
            </Button>
          </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default SelectionScreen;