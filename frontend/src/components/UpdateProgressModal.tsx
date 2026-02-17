import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { useLanguage } from '../i18n/LanguageContext';

interface UpdateProgressModalProps {
  open: boolean;
  progress: number;
  status: string;
  onClose: () => void;
}

const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({
  open,
  progress,
  status,
  onClose
}) => {
  const { t } = useLanguage();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="h6">{t.updatingYtDlp}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            {status}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5, mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={progress < 100 && progress > 0}>
          {t.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateProgressModal;
