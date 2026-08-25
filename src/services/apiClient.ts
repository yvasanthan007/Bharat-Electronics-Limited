/**
 * Bharat Electronics Limited (BEL) - Backend API Client
 * Enterprise HTTP Client configured for communicating with the BEL Trust Platform Backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('bel_access_token');
  }

  public setAuthToken(token: string) {
    localStorage.setItem('bel_access_token', token);
  }

  public clearAuthToken() {
    localStorage.removeItem('bel_access_token');
    localStorage.removeItem('bel_refresh_token');
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; errors?: any[]; meta?: any }> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await response.json();
      return json;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network request failed',
      };
    }
  }

  // Authentication Endpoints
  public auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) =>
      this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    refreshToken: (refreshToken: string) =>
      this.request('/auth/refresh-token', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
    me: () => this.request('/auth/me'),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
  };

  // Dashboard Endpoints
  public dashboard = {
    getSummary: () => this.request('/dashboard/summary'),
    getCharts: () => this.request('/dashboard/charts'),
    getActivity: () => this.request('/dashboard/activity'),
    getBlockchainStatus: () => this.request('/dashboard/blockchain-status'),
  };

  // Digital Assets Endpoints
  public assets = {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/assets${query}`);
    },
    getById: (id: string) => this.request(`/assets/${id}`),
    getHoldings: () => this.request('/assets/holdings'),
    getAllocation: () => this.request('/assets/allocation'),
    getPerformance: (period?: string) => this.request(`/assets/performance?period=${period || '30D'}`),
    mint: (data: any) => this.request('/assets/mint', { method: 'POST', body: JSON.stringify(data) }),
    toggleFavorite: (id: string) => this.request(`/assets/${id}/favorite`, { method: 'POST' }),
  };

  // Transactions Endpoints
  public transactions = {
    list: (params?: Record<string, any>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.request(`/transactions${query}`);
    },
    getById: (id: string) => this.request(`/transactions/${id}`),
    getSummary: () => this.request('/transactions/summary'),
    getFraudMetrics: () => this.request('/transactions/fraud-metrics'),
    create: (data: any) => this.request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  };

  // Wallets Endpoints
  public wallets = {
    list: () => this.request('/wallets'),
    connect: (data: { address: string; label?: string }) =>
      this.request('/wallets/connect', { method: 'POST', body: JSON.stringify(data) }),
  };

  // Health
  public health = {
    check: () => this.request('/health'),
  };
}

export const belApi = new ApiClient(API_BASE_URL);
export default belApi;
