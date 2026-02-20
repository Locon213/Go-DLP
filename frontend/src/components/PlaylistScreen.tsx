import React from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Grid,
  CircularProgress,
  Checkbox,
  Paper,
  alpha,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  CheckCircle as SelectedIcon,
  ArrowBack as ArrowBackIcon,
  PlaylistPlay as PlaylistIcon,
  AccessTime as AccessTimeIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
} from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface PlaylistEntry {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  duration: number;
}

interface PlaylistScreenProps {
  playlistInfo: {
    id: string;
    title: string;
    description: string;
    entryCount: number;
    entries: PlaylistEntry[];
  };
  selectedVideos: string[]; // IDs of selected videos
  setSelectedVideos: (ids: string[]) => void;
  onBack: () => void;
  onDownloadSelected: () => void;
  isDownloading: boolean;
  isProcessingSelection: boolean;
  formatDuration: (seconds: number) => string;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  playlistInfo,
  selectedVideos,
  setSelectedVideos,
  onBack,
  onDownloadSelected,
  isDownloading,
  isProcessingSelection,
  formatDuration
}) => {
  const { t } = useLanguage();
  const { themeStyles, themeStyle, darkMode } = useTheme();
  const themeConfig = themeStyles[themeStyle];

  // Toggle selection of a video
  const toggleVideoSelection = (videoId: string) => {
    if (selectedVideos.includes(videoId)) {
      setSelectedVideos(selectedVideos.filter(id => id !== videoId));
    } else {
      setSelectedVideos([...selectedVideos, videoId]);
    }
  };

  // Select all videos
  const selectAllVideos = () => {
    setSelectedVideos(playlistInfo.entries.map(entry => entry.id));
  };

  // Deselect all videos
  const deselectAllVideos = () => {
    setSelectedVideos([]);
  };

  // Check if all videos are selected
  const allSelected = playlistInfo.entries.length > 0 &&
    playlistInfo.entries.every(entry => selectedVideos.includes(entry.id));

  const extractYoutubeId = (entry: PlaylistEntry): string => {
    if (entry.id && entry.id.length >= 8) return entry.id;
    const url = entry.url || '';
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/) || url.match(/\/watch\/([^?&]+)/);
    return match ? match[1] : '';
  };

  const getThumbnail = (entry: PlaylistEntry): string => {
    if (entry.thumbnail) return entry.thumbnail;
    const id = extractYoutubeId(entry);
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    return '';
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: alpha(themeConfig.primary, 0.15),
              border: '2px solid',
              borderColor: themeConfig.primary,
            }}
          >
            <PlaylistIcon sx={{ color: themeConfig.primary, fontSize: 28 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                background: `linear-gradient(135deg, ${themeConfig.primary} 0%, ${themeConfig.secondary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {playlistInfo.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {playlistInfo.description}
            </Typography>
          </Box>
        </Box>

        {/* Stats and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 3,
              bgcolor: alpha(themeConfig.primary, 0.08),
              border: '1px solid',
              borderColor: alpha(themeConfig.primary, 0.2),
            }}
          >
            <AccessTimeIcon sx={{ color: themeConfig.primary, fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {t.playlistVideosCount}: {playlistInfo.entryCount}
            </Typography>
          </Paper>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SelectAllIcon />}
              onClick={selectAllVideos}
              disabled={allSelected}
              sx={{
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {t.selectAll}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeselectIcon />}
              onClick={deselectAllVideos}
              disabled={selectedVideos.length === 0}
              sx={{
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {t.deselectAll}
            </Button>
          </Box>
        </Box>

        {/* Selection Counter */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip
            icon={<SelectedIcon sx={{ fontSize: 18 }} />}
            label={`${t.selected}: ${selectedVideos.length}`}
            sx={{
              bgcolor: selectedVideos.length > 0 ? alpha(themeConfig.primary, 0.15) : 'transparent',
              color: selectedVideos.length > 0 ? themeConfig.primary : 'text.secondary',
              fontWeight: 500,
              borderRadius: 2,
              border: '1px solid',
              borderColor: selectedVideos.length > 0 ? alpha(themeConfig.primary, 0.3) : 'divider',
              '& .MuiChip-icon': {
                color: selectedVideos.length > 0 ? themeConfig.primary : 'text.secondary',
              },
            }}
          />
        </Box>

        {/* Video List */}
        <Box
          sx={{
            maxHeight: '60vh',
            overflow: 'auto',
            mb: 3,
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
            {playlistInfo.entries.map((entry, index) => {
              const isSelected = selectedVideos.includes(entry.id);
              const thumbnail = getThumbnail(entry);
              
              return (
                <ListItem
                  key={entry.id}
                  sx={{
                    mb: 1.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isSelected ? alpha(themeConfig.primary, 0.3) : 'divider',
                    bgcolor: isSelected ? alpha(themeConfig.primary, 0.08) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(themeConfig.primary, 0.12)
                        : alpha(darkMode ? '#fff' : '#000', 0.03),
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => toggleVideoSelection(entry.id)}
                >
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      src={thumbnail || undefined}
                      sx={{
                        width: 100,
                        height: 60,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {!thumbnail && <PlayIcon sx={{ color: 'text.secondary' }} />}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? themeConfig.primary : 'text.primary',
                          }}
                        >
                          {entry.title}
                        </Typography>
                        {isSelected && (
                          <SelectedIcon sx={{ color: themeConfig.primary, fontSize: 20 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t.videoIndex}: {index + 1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.duration > 0 ? formatDuration(entry.duration) : t.unknownDuration}
                        </Typography>
                      </Box>
                    }
                  />

                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleVideoSelection(entry.id)}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      color: themeConfig.primary,
                      '&.Mui-checked': {
                        color: themeConfig.primary,
                      },
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Action Buttons */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              disabled={isDownloading}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 3,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {t.back}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={(isDownloading || isProcessingSelection) ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <DownloadIcon />}
              onClick={onDownloadSelected}
              disabled={selectedVideos.length === 0 || isDownloading || isProcessingSelection}
              sx={{
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 3,
                color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
              }}
            >
              {isDownloading
                ? t.downloading
                : (isProcessingSelection ? t.analyzing : `${t.downloadSelected} (${selectedVideos.length})`)}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default PlaylistScreen;
