import { apiClient } from './client';

export const accountingApi = {
  async runNightAudit(auditDate?: string): Promise<any> {
    return apiClient.post('/api/v1/accounting/night-audit/run', { auditDate });
  },

  async getNightAuditHistory(): Promise<any[]> {
    return apiClient.get('/api/v1/accounting/night-audit/history');
  },

  async getPnl(startDate?: string, endDate?: string): Promise<any> {
    return apiClient.get('/api/v1/accounting/reports/pnl', { startDate, endDate });
  },

  async getBalanceSheet(): Promise<any> {
    return apiClient.get('/api/v1/accounting/reports/balance-sheet');
  },

  async getCashFlow(): Promise<any> {
    return apiClient.get('/api/v1/accounting/reports/cash-flow');
  },
};
