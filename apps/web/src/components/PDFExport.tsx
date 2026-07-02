import React from 'react';
import { Button } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PDFExportProps {
  data: any[];
  headers: { label: string; key: string }[];
  filename: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export function PDFExport({
  data,
  headers,
  filename,
  title,
  subtitle,
  buttonLabel = "Export PDF",
  variant = "outlined",
  size = "small"
}: PDFExportProps) {

  const handleExport = () => {
    if (!data || data.length === 0) return;

    try {
      const doc = new jsPDF();

      // --- 1. Document Title & Header ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(79, 70, 229); // primary indigo color
      doc.text("CAMPUS NOTIFICATION PORTAL", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59); // text primary
      doc.text(title, 14, 25);

      if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // text secondary
        doc.text(subtitle, 14, 31);
      }

      // Metadata timestamp
      const dateStr = new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date());
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate 400
      doc.text(`Generated on: ${dateStr}`, 14, 37);

      // --- 2. Table Content Formatting ---
      const tableHead = [headers.map(h => h.label)];
      const tableBody = data.map(item => {
        return headers.map(h => {
          const keys = h.key.split('.');
          let val = item;
          for (const k of keys) {
            val = val ? val[k] : '';
          }
          return val !== undefined && val !== null ? String(val) : '';
        });
      });

      // --- 3. Render Table using autoTable ---
      (doc as any).autoTable({
        startY: 42,
        head: tableHead,
        body: tableBody,
        theme: 'striped',
        headStyles: {
          fillColor: [79, 70, 229], // Indigo 600
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // slate 50
        },
        margin: { top: 40, left: 14, right: 14 }
      });

      // Save document
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={!data || data.length === 0}
      startIcon={<PdfIcon />}
      sx={{ fontWeight: 600 }}
    >
      {buttonLabel}
    </Button>
  );
}
