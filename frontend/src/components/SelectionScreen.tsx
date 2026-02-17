import React, { useState, useMemo } from 'react';
import { Box, Card, CardMedia, Grid, Typography, Chip, List, ListItem, ListItemText, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { AccessTime as AccessTimeIcon, Person as PersonIcon, ViewList as ViewListIcon, Storage as StorageIcon, Videocam as VideocamIcon, Audiotrack as AudiotrackIcon, ArrowBack as ArrowBackIcon, Download as DownloadIcon, HighQuality as HighQualityIcon, Sort as SortIcon, Movie as MovieIcon, MusicNote as MusicNoteIcon, MergeType as MergeTypeIcon, ThumbUp } from '@mui/icons-material';
import { VideoInfo, Format } from '../types';
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

type FilterType = 'all' | 'video' | 'audio' | 'both';
type SortType = 'quality' | 'size';

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
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('quality');

  // Helper function to check if format has video
  const hasVideo = (format: Format): boolean => {
    return format.resolution !== undefined && format.vcodec !== 'none';
  };

  // Helper function to check if format has audio
  const hasAudio = (format: Format): boolean => {
    return format.acodec !== 'none' && format.acodec !== undefined;
  };

  // Helper function to get resolution height
  const getResolutionHeight = (resolution: string | undefined): number => {
    if (!resolution) return 0;
    const parts = resolution.split('x');
    return parts.length === 2 ? parseInt(parts[1]) : 0;
  };

  // Helper function to get file size in bytes
  const getFileSizeBytes = (format: Format): number => {
    if (format.filesize) return Number(format.filesize);
    if (format.filesizeApprox) {
      if (typeof format.filesizeApprox === 'string') {
        return parseInt(format.filesizeApprox);
      }
      return format.filesizeApprox;
    }
    return 0;
  };

  // Check if format is recommended (720p+ with both audio and video)
  const isRecommended = (format: Format): boolean => {
    const height = getResolutionHeight(format.resolution);
    return hasVideo(format) && hasAudio(format) && height >= 720;
  };

  // Processed and filtered formats
  const processedFormats = useMemo(() => {
    let formats = videoInfo.formats.filter(format => {
      return (format.resolution || (format.acodec !== 'none' && format.vcodec === 'none')) && format.format_id;
    });

    // Apply type filter
    formats = formats.filter(format => {
      switch (filterType) {
        case 'video':
          return hasVideo(format) && !hasAudio(format);
        case 'audio':
          return !hasVideo(format) && hasAudio(format);
        case 'both':
          return hasVideo(format) && hasAudio(format);
        case 'all':
        default:
          return true;
      }
    });

    // Apply sorting
    formats = formats.sort((a, b) => {
      if (sortType === 'quality') {
        // Sort by resolution (highest first)
        const aHeight = getResolutionHeight(a.resolution);
        const bHeight = getResolutionHeight(b.resolution);
        
        if (bHeight !== aHeight) {
          return bHeight - aHeight;
        }
        
        // If same resolution, prefer formats with both audio and video
        const aScore = (hasVideo(a) ? 1 : 0) + (hasAudio(a) ? 1 : 0);
        const bScore = (hasVideo(b) ? 1 : 0) + (hasAudio(b) ? 1 : 0);
        
        if (bScore !== aScore) {
          return bScore - aScore;
        }
        
        // Then by file size
        return getFileSizeBytes(b) - getFileSizeBytes(a);
      } else {
        // Sort by size (smallest first)
        return getFileSizeBytes(a) - getFileSizeBytes(b);
      }
    });

    return formats;
  }, [videoInfo.formats, filterType, sortType]);

  // Find best quality format for auto-selection
  const bestQualityFormat = useMemo(() => {
    const videoFormats = videoInfo.formats.filter(f => hasVideo(f) && hasAudio(f) && getResolutionHeight(f.resolution) >= 720);
    if (videoFormats.length > 0) {
      return videoFormats.sort((a, b) => getResolutionHeight(b.resolution) - getResolutionHeight(a.resolution))[0];
    }
    return null;
  }, [videoInfo.formats]);

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

            {/* Compact Filters */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Type Filter */}
              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={(_, value) => value && setFilterType(value)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    borderRadius: 2,
                    mr: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="all" sx={{ display: 'flex', gap: 0.5 }}>
                  <ViewListIcon fontSize="small" />
                  {t.filterAll}
                </ToggleButton>
                <ToggleButton value="both" sx={{ display: 'flex', gap: 0.5 }}>
                  <MergeTypeIcon fontSize="small" />
                  {t.filterVideoAudio}
                </ToggleButton>
                <ToggleButton value="video" sx={{ display: 'flex', gap: 0.5 }}>
                  <MovieIcon fontSize="small" />
                  {t.filterVideo}
                </ToggleButton>
                <ToggleButton value="audio" sx={{ display: 'flex', gap: 0.5 }}>
                  <MusicNoteIcon fontSize="small" />
                  {t.filterAudio}
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Sort Filter */}
              <ToggleButtonGroup
                value={sortType}
                exclusive
                onChange={(_, value) => value && setSortType(value)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'secondary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="quality" sx={{ display: 'flex', gap: 0.5 }}>
                  <HighQualityIcon fontSize="small" />
                  {t.sortQuality}
                </ToggleButton>
                <ToggleButton value="size" sx={{ display: 'flex', gap: 0.5 }}>
                  <SortIcon fontSize="small" />
                  {t.sortSize}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Quick Select Best Quality */}
            {bestQualityFormat && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<ThumbUp />}
                  onClick={() => setSelectedFormat(bestQualityFormat.format_id)}
                  sx={{ borderRadius: 2 }}
                >
                  {t.selectBestQuality} ({bestQualityFormat.resolution})
                </Button>
              </Box>
            )}

            <Box sx={{
              maxHeight: 400,
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
                {processedFormats.map((format, index) => (
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {format.resolution ? (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                              <VideocamIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                              {format.resolution}
                            </Box>
                          ) : (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                              <AudiotrackIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                              {t.filterAudio} ONLY
                            </Box>
                          )}
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {format.ext.toUpperCase()}
                          </Typography>
                          {/* Recommended badge */}
                          {isRecommended(format) && (
                            <Chip
                              icon={<ThumbUp sx={{ fontSize: '0.875rem !important' }} />}
                              label={t.recommended}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 0.5 }
                              }}
                            />
                          )}
                          {selectedFormat === format.format_id && (
                            <Chip
                              label={t.selectedFormat}
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <StorageIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="caption" color="text.secondary">
                            {format.vcodec !== 'none' ? format.vcodec : t.noVideo} + {format.acodec !== 'none' ? format.acodec : t.noAudio}
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
                {processedFormats.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      {t.noFormatsMatchFilter}
                    </Typography>
                  </Box>
                )}
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
