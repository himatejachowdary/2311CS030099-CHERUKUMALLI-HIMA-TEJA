import React from 'react';
import { Button } from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';

interface CSVExportProps {
  data: any[];
  headers: { label: string; key: string }[];
  filename: string;
  buttonLabel?: string;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export function CSVExport({ 
  data, 
  headers, 
  filename, 
  buttonLabel = "Export CSV",
  variant = "outlined",
  size = "small"
}: CSVExportProps) {

  const handleExport = () => {
    if (!data || data.length === 0) return;

    // 1. Compile CSV Header Row
    const headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');

    // 2. Compile CSV Body Rows
    const bodyRows = data.map(item => {
      return headers.map(h => {
        // Resolve nested keys if necessary (e.g., 'address.city')
        const keys = h.key.split('.');
        let val = item;
        for (const k of keys) {
          val = val ? val[k] : '';
        }
        
        // Format string values cleanly
        const valStr = val !== undefined && val !== null ? String(val) : '';
        return `"${valStr.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headerRow, ...bodyRows].join('\n');
    
    // 3. Trigger Browser Blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={!data || data.length === 0}
      startIcon={<FileDownloadIcon />}
      sx={{ fontWeight: 600 }}
    >
      {buttonLabel}
    </Button>
  );
}
