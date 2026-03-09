const API_BASE_URL = "/api/v1";

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: {
        tokens: { accessToken: string; refreshToken: string };
        user: {
          id: string;
          email: string;
          organizationId: string;
          role: string;
        };
      };
    }>("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Organization
  async getOrganization() {
    return this.request<{
      id: string;
      name: string;
      environments: Array<{ id: string; name: string; key: string }>;
    }>("/organization");
  }

  async getStats() {
    return this.request<{
      totalFlags: number;
      totalApiKeys: number;
      activeApiKeys: number;
    }>("/organization/stats");
  }

  // Feature Flags
  async getFlags() {
    return this.request<
      Array<{
        id: string;
        key: string;
        description: string;
        createdAt: string;
      }>
    >("/flags");
  }

  async getFlag(flagId: string) {
    return this.request<{
      id: string;
      key: string;
      description: string;
      createdAt: string;
      environmentValues: Array<{
        environmentId: string;
        environmentName: string;
        environmentKey: string;
        value: boolean | string | number;
      }>;
    }>(`/flags/${flagId}`);
  }

  async createFlag(data: { key: string; description: string }) {
    return this.request<{ id: string }>("/flags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFlagEnvironmentValue(
    flagId: string,
    environmentId: string,
    value: boolean | string | number,
  ) {
    return this.request(`/flags/${flagId}/environments/${environmentId}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  // API Keys
  async getApiKeys() {
    return this.request<
      Array<{
        id: string;
        environment: string;
        status: "active" | "revoked";
        createdAt: string;
      }>
    >("/api-keys");
  }

  async createApiKey(environmentId: string) {
    return this.request<{
      id: string;
      key: string;
      environment: string;
    }>("/api-keys", {
      method: "POST",
      body: JSON.stringify({ environmentId }),
    });
  }

  async revokeApiKey(keyId: string) {
    return this.request(`/api-keys/${keyId}/revoke`, {
      method: "POST",
    });
  }

  // Audit Logs
  async getAuditLogs(params?: { page?: number; action?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.action) queryParams.set("action", params.action);

    const query = queryParams.toString();
    return this.request<{
      logs: Array<{
        id: string;
        action: string;
        target: string;
        environment: string;
        timestamp: string;
        userId: string;
        userEmail: string;
      }>;
      pagination: {
        page: number;
        totalPages: number;
        totalItems: number;
      };
    }>(`/audit-logs${query ? `?${query}` : ""}`);
  }
}

export const apiService = new ApiService();
