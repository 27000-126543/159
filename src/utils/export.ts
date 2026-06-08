import * as XLSX from 'xlsx';

export interface ExportColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  title: string;
  width?: number;
  formatter?: (value: unknown, row: T) => string;
}

export function exportToExcel<T = Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = 'export',
  sheetName: string = 'Sheet1',
): void {
  const formattedData = data.map((row) => {
    const formattedRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      const key = col.key as string;
      const value = row[key as keyof T];
      formattedRow[col.title] = col.formatter ? col.formatter(value, row) : value;
    });
    return formattedRow;
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);

  const colWidths = columns.map((col) => ({
    wch: col.width || Math.max(col.title.length * 2, 10),
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCsv<T = Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = 'export',
): void {
  const headers = columns.map((col) => col.title).join(',');

  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const key = col.key as string;
        const value = row[key as keyof T];
        const formatted = col.formatter ? col.formatter(value, row) : String(value ?? '');
        if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }
        return formatted;
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMultipleSheets<T = Record<string, unknown>>(
  sheets: {
    data: T[];
    columns: ExportColumn<T>[];
    sheetName: string;
  }[],
  filename: string = 'export',
): void {
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const formattedData = sheet.data.map((row) => {
      const formattedRow: Record<string, unknown> = {};
      sheet.columns.forEach((col) => {
        const key = col.key as string;
        const value = row[key as keyof T];
        formattedRow[col.title] = col.formatter ? col.formatter(value, row) : value;
      });
      return formattedRow;
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);

    const colWidths = sheet.columns.map((col) => ({
      wch: col.width || Math.max(col.title.length * 2, 10),
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}
