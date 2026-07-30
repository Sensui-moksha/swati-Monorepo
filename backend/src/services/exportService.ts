import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { createObjectCsvStringifier } from 'csv-writer';

export class ExportService {
  /**
   * Generates an Excel workbook buffer from JSON data.
   */
  async exportToExcel(data: any[], sheetName = 'Report'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      // Auto-generate columns from the first object's keys
      worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key.toUpperCase(),
        key: key,
        width: 20
      }));

      // Add rows
      data.forEach(row => worksheet.addRow(row));
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as any as Buffer;
  }

  /**
   * Generates a CSV string from JSON data.
   */
  exportToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(data[0]).map(key => ({ id: key, title: key.toUpperCase() }))
    });

    const header = csvStringifier.getHeaderString();
    const records = csvStringifier.stringifyRecords(data);
    
    return `${header}${records}`;
  }

  /**
   * Generates a PDF buffer with a simple table layout from JSON data.
   */
  async exportToPDF(data: any[], title = 'Executive Report'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown(2);

      if (data.length > 0) {
        doc.fontSize(10);
        const keys = Object.keys(data[0]);
        
        // Very basic JSON dump layout for the MVP PDF generator
        data.forEach((row, idx) => {
          doc.text(`Record ${idx + 1}`, { underline: true });
          keys.forEach(key => {
            doc.text(`${key}: ${JSON.stringify(row[key])}`);
          });
          doc.moveDown();
        });
      } else {
        doc.text('No data available for this report.');
      }

      doc.end();
    });
  }
}

export const exportService = new ExportService();
