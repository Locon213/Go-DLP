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
  Button
} from '@mui/material';
import { Delete as DeleteIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';
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

  // Group items by status
  const completedItems = historyItems.filter(item => item.status === 'completed');
  const failedItems = historyItems.filter(item => item.status === 'failed');
  const cancelledItems = historyItems.filter(item => item.status === 'cancelled');

  return (
    <Box sx={{ pb: 4 }}>
      <Card sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" align="center" sx={{
            background: 'linear-gradient(45deg, #FF9800, #F57C00)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            {t.historyTitle}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={onGoToHome}
          >
            {t.goToHome}
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph align="center">
          {t.historyDescriptionText}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Chip 
              label={`${t.completed}: ${completedItems.length}`} 
              color="success"
              variant="outlined"
              sx={{ width: '100%', py: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Chip 
              label={`${t.failed}: ${failedItems.length}`} 
              color="error"
              variant="outlined"
              sx={{ width: '100%', py: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Chip 
              label={`${t.cancelled}: ${cancelledItems.length}`} 
              color="default"
              variant="outlined"
              sx={{ width: '100%', py: 1 }}
            />
          </Grid>
        </Grid>

        {historyItems.length === 0 ? (
          <Typography variant="h6" align="center" color="text.secondary" sx={{ py: 4 }}>
            {t.noHistory}
          </Typography>
        ) : (
          <>
            {historyItems.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onClearHistory}
                >
                  {t.clearHistory}
                </Button>
              </Box>
            )}

            <List>
              {historyItems.map((item) => (
                <ListItem key={item.id} divider sx={{ p: 2 }}>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {(item.downloadedAt || item.dateAdded).toLocaleString()}
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
                  {item.status === 'completed' && item.outputPath && (
                    <IconButton
                      onClick={() => {
                        OpenInExplorer(item.outputPath);
                      }}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  )}
                  <IconButton 
                    onClick={() => onDeleteItem(item.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
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
