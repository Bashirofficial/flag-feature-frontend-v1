const API_BASE_URL = "/api/v1";
type FlagValue = string | number | boolean | Record<string, unknown> | null;

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
      ...(options.headers as Record<string, string>),
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
        .catch(() => ({ message: "Request failed", success: false }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  // ============================================
  // AUTH
  // ============================================

  async login(email: string, password: string) {
    return this.request<{
      user: {
        id: string;
        email: string;
        role: string;
        organizationId: string;
      };
      tokens: { accessToken: string; refreshToken: string };
    }>("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    organizationName: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request<{
      user: {
        id: string;
        email: string;
        role: string;
        organizationId: string;
      };
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    }>("/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{
      accessToken: string;
    }>("/user/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(refreshToken?: string) {
    return this.request("/user/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  // ============================================
  // ORGANIZATION
  // ============================================

  async getOrganization() {
    return this.request<{
      id: string;
      name: string;
      slug: string;
      createdAt: string;
      updatedAt: string;
    }>("/organization");
  }

  async getStats() {
    return this.request<{
      totalFlags: number;
      totalApiKeys: number;
      activeApiKeys: number;
    }>("/organization/stats");
  }

  // ============================================
  // ENVIRONMENTS
  // ============================================

  async getEnvironments() {
    return this.request<
      Array<{
        id: string;
        name: string;
        key: string;
        description: string;
        sortOrder: number;
        apiKeyCount: number;
        flagCount: number;
        createdAt: string;
        updatedAt: string;
      }>
    >("/environments");
  }

  async getEnvironment(id: string) {
    return this.request<{
      id: string;
      name: string;
      key: string;
      description: string;
      sortOrder: number;
      apiKeyCount: number;
      flagCount: number;
      createdAt: string;
      updatedAt: string;
    }>(`/environments/${id}`);
  }

  async createEnvironment(data: {
    name: string;
    key: string;
    description?: string;
  }) {
    return this.request<{ id: string }>("/environments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEnvironment(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    return this.request(`/environments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteEnvironment(id: string) {
    return this.request(`/environments/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================
  // FEATURE FLAGS
  // ============================================

  async getFlags() {
    return this.request<
      Array<{
        id: string;
        key: string;
        name: string;
        description: string;
        type: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>
    >("/flags");
  }

  async getFlag(flagId: string) {
    return this.request<{
      id: string;
      key: string;
      name: string;
      description: string;
      type: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      environmentValues: Array<{
        value: FlagValue;
        environment: {
          id: string;
          name: string;
          key: string;
        };
      }>;
    }>(`/flags/${flagId}`);
  }

  async createFlag(data: {
    key: string;
    description: string;
    name?: string;
    type?: "BOOLEAN" | "STRING" | "NUMBER" | "JSON";
    defaultValue?: FlagValue;
  }) {
    return this.request<{ id: string }>("/flags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFlag(
    flagId: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.request(`/flags/${flagId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteFlag(flagId: string) {
    return this.request(`/flags/${flagId}`, {
      method: "DELETE",
    });
  }

  async updateFlagEnvironmentValue(
    flagId: string,
    environmentId: string,
    value: FlagValue,
  ) {
    return this.request(`/flags/${flagId}/environments/${environmentId}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  // ============================================
  // API KEYS
  // ============================================

  async getApiKeys() {
    return this.request<
      Array<{
        id: string;
        name: string;
        keyPrefix: string;
        environment: string;
        environmentKey: string;
        status: "ACTIVE" | "REVOKED";
        lastUsedAt: string | null;
        usageCount: number;
        createdAt: string;
        createdBy: string;
        revokedAt: string | null;
      }>
    >("/api-keys");
  }

  async createApiKey(data: { environmentId: string; name?: string }) {
    return this.request<{
      id: string;
      key: string; // ⚠️ Only returned once!
      keyPrefix: string;
      environment: {
        name: string;
        key: string;
      };
    }>("/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async revokeApiKey(keyId: string) {
    return this.request(`/api-keys/${keyId}/revoke`, {
      method: "PATCH",
    });
  }

  async deleteApiKey(keyId: string) {
    return this.request(`/api-keys/${keyId}`, {
      method: "DELETE",
    });
  }
  // ============================================
  // AUDIT LOGS
  // ============================================

  async getAuditLogs(params?: { page?: number; action?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.action) queryParams.set("action", params.action);

    const query = queryParams.toString();
    return this.request<{
      logs: Array<{
        id: string;
        action: string;
        resourceType: string;
        resourceId: string | null;
        resourceName: string | null;
        environmentKey: string | null;
        changes?: Record<string, unknown>;
        ipAddress: string | null;
        userAgent: string | null;
        timestamp: string;
        userId: string;
        userEmail: string;
      }>;
      pagination: {
        page: number;
        totalPages: number;
        totalItems: number;
        pageSize: number;
      };
    }>(`/audit-logs${query ? `?${query}` : ""}`);
  }
}

export const apiService = new ApiService();
