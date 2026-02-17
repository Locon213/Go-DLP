import React, { useState, useMemo } from 'react';
import { Box, Card, CardMedia, Grid, Typography, Chip, List, ListItem, ListItemText, Button, ToggleButtonGroup, ToggleButton, Paper, alpha } from '@mui/material';
import { AccessTime as AccessTimeIcon, Person as PersonIcon, ViewList as ViewListIcon, Storage as StorageIcon, Videocam as VideocamIcon, Audiotrack as AudiotrackIcon, ArrowBack as ArrowBackIcon, Download as DownloadIcon, HighQuality as HighQualityIcon, Sort as SortIcon, Movie as MovieIcon, MusicNote as MusicNoteIcon, MergeType as MergeTypeIcon, ThumbUp, CheckCircle } from '@mui/icons-material';
import { VideoInfo, Format } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

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
  const { themeStyles, themeStyle, darkMode } = useTheme();
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

  const themeConfig = themeStyles[themeStyle];

  return (
    <Box sx={{ pb: 4 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={0}>
          {/* Video Info Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'relative' }}>
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
                  height: 280,
                  objectFit: 'cover',
                  width: '100%',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  p: 2,
                }}
              >
                <Chip
                  icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                  label={formatDuration(videoInfo.duration)}
                  size="small"
                  sx={{
                    bgcolor: alpha(themeConfig.primary, 0.9),
                    color: 'white',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: 'white' },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.3,
                }}
              >
                {videoInfo.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<PersonIcon sx={{ fontSize: 16 }} />}
                  label={videoInfo.uploader || 'Unknown'}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              {videoInfo.description && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                    maxHeight: 100,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {videoInfo.description}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Format Selection Section */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
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
                      py: 0.75,
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      mr: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&.Mui-selected': {
                        bgcolor: alpha(themeConfig.primary, 0.15),
                        borderColor: themeConfig.primary,
                        color: themeConfig.primary,
                        '&:hover': {
                          bgcolor: alpha(themeConfig.primary, 0.25),
                        },
                      },
                    },
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
                      py: 0.75,
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&.Mui-selected': {
                        bgcolor: alpha(themeConfig.secondary, 0.15),
                        borderColor: themeConfig.secondary,
                        color: themeConfig.secondary,
                        '&:hover': {
                          bgcolor: alpha(themeConfig.secondary, 0.25),
                        },
                      },
                    },
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
                    sx={{
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 },
                    }}
                  >
                    {t.selectBestQuality} ({bestQualityFormat.resolution})
                  </Button>
                </Box>
              )}

              {/* Format List */}
              <Box
                sx={{
                  flex: 1,
                  maxHeight: 380,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(darkMode ? '#fff' : '#000', 0.2),
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: alpha(darkMode ? '#fff' : '#000', 0.3),
                  },
                }}
              >
                <List sx={{ p: 0 }}>
                  {processedFormats.map((format, index) => {
                    const isSelected = selectedFormat === format.format_id;
                    const recommended = isRecommended(format);
                    
                    return (
                      <ListItem
                        key={`${format.format_id}-${index}`}
                        onClick={() => setSelectedFormat(format.format_id)}
                        sx={{
                          borderRadius: 3,
                          mb: 1,
                          border: '1px solid',
                          borderColor: isSelected ? themeConfig.primary : 'divider',
                          bgcolor: isSelected
                            ? alpha(themeConfig.primary, darkMode ? 0.15 : 0.08)
                            : 'transparent',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: isSelected
                              ? alpha(themeConfig.primary, darkMode ? 0.2 : 0.12)
                              : alpha(darkMode ? '#fff' : '#000', 0.04),
                            cursor: 'pointer',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              {format.resolution ? (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                  <VideocamIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                                  {format.resolution}
                                </Box>
                              ) : (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                  <AudiotrackIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                                  {t.filterAudio} ONLY
                                </Box>
                              )}
                              <Typography
                                variant="caption"
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: alpha(darkMode ? '#fff' : '#000', 0.1),
                                  fontWeight: 600,
                                }}
                              >
                                {format.ext.toUpperCase()}
                              </Typography>
                              {recommended && (
                                <Chip
                                  icon={<ThumbUp sx={{ fontSize: '0.75rem !important' }} />}
                                  label={t.recommended}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.65rem',
                                    borderRadius: 2,
                                    '& .MuiChip-label': { px: 0.5 },
                                  }}
                                />
                              )}
                              {isSelected && (
                                <Chip
                                  icon={<CheckCircle sx={{ fontSize: '0.75rem !important' }} />}
                                  label={t.selectedFormat}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.65rem',
                                    borderRadius: 2,
                                    bgcolor: themeConfig.primary,
                                    color: 'white',
                                    '& .MuiChip-icon': { color: 'white' },
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <StorageIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary">
                                {format.vcodec !== 'none' ? format.vcodec : t.noVideo} + {format.acodec !== 'none' ? format.acodec : t.noAudio}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ textAlign: 'right', ml: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: themeConfig.primary,
                            }}
                          >
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
                    );
                  })}
                  {processedFormats.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">{t.noFormatsMatchFilter}</Typography>
                    </Box>
                  )}
                </List>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setCurrentStep('input')}
                  sx={{
                    flex: 1,
                    borderRadius: 3,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 },
                  }}
                >
                  {t.back}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => setCurrentStep('savepath')}
                  disabled={!selectedFormat || isDownloading}
                  sx={{
                    flex: 1,
                    borderRadius: 3,
                  }}
                >
                  {isDownloading ? t.downloading : t.download}
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default SelectionScreen;
