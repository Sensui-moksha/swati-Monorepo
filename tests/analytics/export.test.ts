import { exportService } from '../../backend/src/services/exportService';

describe('Export Service', () => {
  const mockData = [
    { id: 1, name: 'Report A', value: 100 },
    { id: 2, name: 'Report B', value: 200 }
  ];

  it('should generate a CSV string correctly', () => {
    const csv = exportService.exportToCSV(mockData);
    
    // Check headers
    expect(csv).toContain('ID,NAME,VALUE');
    // Check rows
    expect(csv).toContain('1,Report A,100');
    expect(csv).toContain('2,Report B,200');
  });

  it('should return empty string for empty array in CSV', () => {
    const csv = exportService.exportToCSV([]);
    expect(csv).toBe('');
  });

  it('should generate an Excel buffer', async () => {
    const excelBuffer = await exportService.exportToExcel(mockData, 'TestSheet');
    expect(excelBuffer).toBeInstanceOf(Buffer);
    expect(excelBuffer.length).toBeGreaterThan(0);
  });

  it('should generate a PDF buffer', async () => {
    const pdfBuffer = await exportService.exportToPDF(mockData, 'Test Title');
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
