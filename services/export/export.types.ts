type ExportFormat = "csv";

interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
}

interface ExportResult {
  filePath: string;
  fileName: string;
  mimeType: string;
}

export { ExportFormat, ExportOptions, ExportResult };
