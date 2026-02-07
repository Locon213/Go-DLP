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
  FormControlLabel,
  Chip
} from '@mui/material';
import { PlayArrow as PlayIcon, Download as DownloadIcon, CheckCircle as SelectedIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';

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
  formatDuration: (seconds: number) => string;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  playlistInfo,
  selectedVideos,
  setSelectedVideos,
  onBack,
  onDownloadSelected,
  isDownloading,
  formatDuration
}) => {
  const { t } = useLanguage();

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

  return (
    <Box sx={{ spacing: 4, pb: 4 }}>
      <Card sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{
          background: 'linear-gradient(45deg, #2196F3, #9C27B0)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebKitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          {playlistInfo.title}
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          {playlistInfo.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle1">
            {t.playlistVideosCount}: {playlistInfo.entryCount}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={selectAllVideos}
              disabled={allSelected}
            >
              {t.selectAll}
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={deselectAllVideos}
              disabled={selectedVideos.length === 0}
            >
              {t.deselectAll}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Chip 
            label={`${t.selected}: ${selectedVideos.length}`}
            color={selectedVideos.length > 0 ? "primary" : "default"}
            variant={selectedVideos.length > 0 ? "filled" : "outlined"}
          />
        </Box>

        <List sx={{ maxHeight: '60vh', overflow: 'auto', mb: 3 }}>
          {playlistInfo.entries.map((entry, index) => (
            <ListItem 
              key={entry.id} 
              divider 
              sx={{ 
                p: 2, 
                '&:hover': { 
                  backgroundColor: 'action.hover',
                  cursor: 'pointer'
                },
                borderLeft: selectedVideos.includes(entry.id) ? '4px solid #1976d2' : '4px solid transparent'
              }}
              onClick={() => toggleVideoSelection(entry.id)}
            >
              <ListItemAvatar>
                <Avatar 
                  variant="rounded" 
                  src={entry.thumbnail || undefined}
                  sx={{ width: 80, height: 60 }}
                >
                  {!entry.thumbnail && <PlayIcon />}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{entry.title}</span>
                    {selectedVideos.includes(entry.id) && (
                      <SelectedIcon color="primary" sx={{ ml: 1 }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t.videoIndex}: {index + 1}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.duration > 0 ? formatDuration(entry.duration) : t.unknownDuration}
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedVideos.includes(entry.id)}
                    onChange={() => toggleVideoSelection(entry.id)}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
                  />
                }
                label=""
                sx={{ margin: 0 }}
              />
            </ListItem>
          ))}
        </List>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={onBack}
              disabled={isDownloading}
              sx={{ py: 1.5, fontSize: '1.2rem' }}
            >
              {t.back}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              onClick={onDownloadSelected}
              disabled={selectedVideos.length === 0 || isDownloading}
              startIcon={isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
              sx={{ py: 1.5, fontSize: '1.2rem' }}
            >
              {isDownloading ? t.downloading : `${t.downloadSelected} (${selectedVideos.length})`}
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default PlaylistScreen;