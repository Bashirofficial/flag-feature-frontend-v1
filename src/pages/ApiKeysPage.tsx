import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";

// Updated to match actual API response
interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  environment: string;
  environmentKey: string;
  status: "ACTIVE" | "REVOKED"; // ← Uppercase, not lowercase
  lastUsedAt: string | null;
  usageCount: number;
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
}

interface Environment {
  id: string;
  name: string;
  key: string;
  description: string;
  sortOrder: number;
  apiKeyCount: number;
  flagCount: number;
}

export const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEnvId, setSelectedEnvId] = useState("");
  const [keyName, setKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch environments separately (not from organization)
      const [keysData, envsData] = await Promise.all([
        apiService.getApiKeys(),
        apiService.getEnvironments(), // ← Changed from getOrganization()
      ]);
      setApiKeys(keysData);
      setEnvironments(envsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateKey = async () => {
    if (!selectedEnvId) {
      setError("Please select an environment");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Updated to match API signature: { environmentId, name? }
      const result = await apiService.createApiKey({
        environmentId: selectedEnvId,
        name: keyName || undefined,
      });
      setCreatedKey(result.key);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this API key? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await apiService.revokeApiKey(keyId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setCreatedKey(null);
    setSelectedEnvId("");
    setKeyName("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
        >
          Create API Key
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Key Prefix
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Environment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Usage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {apiKeys.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            ) : (
              apiKeys.map((key) => (
                <tr key={key.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {key.name || (
                      <span className="text-gray-400 italic">Unnamed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">
                    {key.keyPrefix}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>{key.environment}</div>
                    <div className="text-xs text-gray-500">
                      {key.environmentKey}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        key.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {key.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>{key.usageCount} requests</div>
                    {key.lastUsedAt && (
                      <div className="text-xs text-gray-400">
                        Last: {new Date(key.lastUsedAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {key.status === "ACTIVE" && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded hover:bg-red-100"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {createdKey ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  API Key Created
                </h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    ⚠️ Copy this key now. You won't be able to see it again.
                  </p>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded font-mono text-sm break-all mb-2">
                    {createdKey}
                  </div>
                  <button
                    onClick={() => copyToClipboard(createdKey)}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Create API Key
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g., Production Mobile App"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environment
                  </label>
                  <select
                    value={selectedEnvId}
                    onChange={(e) => setSelectedEnvId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="">Select environment</option>
                    {environments.map((env) => (
                      <option key={env.id} value={env.id}>
                        {env.name} ({env.key})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateKey}
                    disabled={isCreating || !selectedEnvId}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
