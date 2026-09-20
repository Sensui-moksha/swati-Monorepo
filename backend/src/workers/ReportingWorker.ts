import cron from 'node-cron';
import nodemailer, { type Transporter } from 'nodemailer';
import { analyticsService } from '../services/analyticsService';
import { exportService } from '../services/exportService';
import { logger } from '../utils/logger';

export class ReportingWorker {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'pass'
      }
    });
  }

  /**
   * Initializes the scheduled CRON jobs for BI Reporting.
   */
  public startJobs() {
    // Daily Executive Report at 8:00 AM
    cron.schedule('0 8 * * *', () => this.generateAndSendDailyReport());

    // Weekly Finance Report on Monday at 9:00 AM
    cron.schedule('0 9 * * 1', () => this.generateAndSendWeeklyReport());

    logger.info('Reporting Worker initialized and scheduled CRON jobs.');
  }

  private async generateAndSendDailyReport() {
    try {
      logger.info('Generating Daily Executive Report...');
      
      const dashboard = await analyticsService.getExecutiveDashboard();
      
      // Formatting the trend data for CSV attachment
      const csvData = exportService.exportToCSV(dashboard.trends);

      await this.transporter.sendMail({
        from: '"Swathi BI System" <noreply@swathipublications.com>',
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject: `Daily Executive Summary - ${new Date().toLocaleDateString()}`,
        html: `
          <h1>Daily Executive Summary</h1>
          <p>Total Revenue MRR: $${dashboard.kpis.mrr}</p>
          <p>Active Users: ${dashboard.kpis.activeUsers}</p>
          <p>Active Subscriptions: ${dashboard.systemHealth.pdfCount} PDFs Hosted</p>
        `,
        attachments: [
          {
            filename: `Revenue_Trends_${new Date().toISOString().split('T')[0]}.csv`,
            content: csvData
          }
        ]
      });

      logger.info('Daily Executive Report sent successfully.');
    } catch (error) {
      logger.error('Failed to generate daily report', { error });
    }
  }

  private async generateAndSendWeeklyReport() {
    // Similar to daily, but specifically generating a PDF for weekly financials
    try {
      logger.info('Generating Weekly Finance Report...');
      const financeData = await analyticsService.getFinancialReports();
      const pdfBuffer = await exportService.exportToPDF(financeData.revenueTrends, 'Weekly Financial Summary');

      await this.transporter.sendMail({
        from: '"Swathi BI System" <noreply@swathipublications.com>',
        to: process.env.FINANCE_EMAIL || 'finance@example.com',
        subject: `Weekly Finance Report - ${new Date().toLocaleDateString()}`,
        html: `<p>Please find attached the weekly financial summary and revenue trends.</p>`,
        attachments: [
          {
            filename: `Weekly_Finance_${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer
          }
        ]
      });
      logger.info('Weekly Finance Report sent successfully.');
    } catch (error) {
      logger.error('Failed to generate weekly report', { error });
    }
  }
}

// Export a singleton instance
export const reportingWorker = new ReportingWorker();
