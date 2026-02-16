import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { LanguageCode, supportedLanguages } from '../i18n';

interface LanguageSelectorProps {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  label?: string;
  fullWidth?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
  label = 'Language',
  fullWidth = true
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onLanguageChange(event.target.value as LanguageCode);
  };

  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel id="language-select-label">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageIcon fontSize="small" />
          {label}
        </Box>
      </InputLabel>
      <Select
        labelId="language-select-label"
        value={language}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon fontSize="small" />
            {label}
          </Box>
        }
        onChange={handleChange}
      >
        {supportedLanguages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
