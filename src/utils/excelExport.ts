/**
 * Excel Export Utility
 * 
 * Provides reusable functionality for exporting data to Excel (.xlsx) format
 * Supports bilingual headers (English/Arabic) and handles large datasets
 */

import ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelExportOptions {
  fileName: string;
  sheetName: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  locale?: string;
}

/**
 * Export data to Excel file
 * @param options Export configuration options
 */
export async function exportToExcel(options: ExcelExportOptions): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fileName, sheetName, columns, data, locale = 'en-US' } = options;

  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Future Step Nursery';
    workbook.created = new Date();

    // Add a worksheet
    const worksheet = workbook.addWorksheet(sheetName);

    // Set up columns
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 15
    }));

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    data.forEach((item) => {
      const row = worksheet.addRow(item);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    });

    // Auto-fit columns (optional enhancement)
    worksheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      }
    });

    // Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
}

/**
 * Format Firestore timestamp to readable date string
 */
export function formatFirestoreTimestamp(timestamp: { _seconds?: number; seconds?: number; _nanoseconds?: number; nanoseconds?: number } | Date | string): string {
  if (!timestamp) return '';
  
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString();
  }
  
  const seconds = timestamp._seconds || timestamp.seconds;
  if (seconds) {
    return new Date(seconds * 1000).toLocaleString();
  }
  
  return '';
}

/**
 * Get localized export button text
 */
export function getExportButtonText(locale: string): string {
  return locale === 'ar-SA' ? 'تصدير إلى Excel' : 'Export to Excel';
}
