import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiService } from "../services/api";

// Update interface to match actual API response (nested structure)
interface EnvironmentValue {
  value: string | number | boolean | Record<string, unknown> | null;
  environment: {
    id: string;
    name: string;
    key: string;
  };
}

interface Flag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  environmentValues: EnvironmentValue[];
}

export const FlagDetailPage: React.FC = () => {
  const { flagId } = useParams<{ flagId: string }>();
  const [flag, setFlag] = useState<Flag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEnv, setEditingEnv] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchFlag = async () => {
    if (!flagId) return;

    try {
      const data = await apiService.getFlag(flagId);
      setFlag(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flag");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlag();
  }, [flagId]);

  const handleEdit = (envValue: EnvironmentValue) => {
    setEditingEnv(envValue.environment.id);
    setEditValue(String(envValue.value));
    setSuccessMessage("");
  };

  const handleSave = async (environmentId: string) => {
    if (!flagId) return;

    try {
      // Attempt to parse as boolean or number
      let parsedValue: any = editValue;
      if (editValue.toLowerCase() === "true") parsedValue = true;
      else if (editValue.toLowerCase() === "false") parsedValue = false;
      else if (!isNaN(Number(editValue))) parsedValue = Number(editValue);

      await apiService.updateFlagEnvironmentValue(
        flagId,
        environmentId,
        parsedValue,
      );

      setEditingEnv(null);
      setSuccessMessage("Value updated successfully");

      // Refresh flag data
      await fetchFlag();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update value");
    }
  };

  const handleCancel = () => {
    setEditingEnv(null);
    setEditValue("");
  };

  const toggleBoolean = async (
    environmentId: string,
    currentValue: boolean,
  ) => {
    if (!flagId) return;

    try {
      await apiService.updateFlagEnvironmentValue(
        flagId,
        environmentId,
        !currentValue,
      );
      setSuccessMessage("Value toggled successfully");
      await fetchFlag();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle value");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!flag) {
    return (
      <div className="p-8">
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Flag not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link to="/flags" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Flags
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-mono text-gray-900 mb-2">
          {flag.key}
        </h1>
        <p className="text-sm text-gray-600">{flag.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          Created {new Date(flag.createdAt).toLocaleDateString()}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">
          Environment Values
        </h2>
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Environment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {flag.environmentValues.map((envValue) => (
                <tr key={envValue.environment.id}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {envValue.environment.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {envValue.environment.key}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingEnv === envValue.environment.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm font-mono text-gray-900">
                        {typeof envValue.value === "object"
                          ? JSON.stringify(envValue.value)
                          : String(envValue.value)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingEnv === envValue.environment.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(envValue.environment.id)}
                          className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {typeof envValue.value === "boolean" &&
                          (() => {
                            const isBoolValue = envValue.value; // TypeScript narrows this to 'boolean'
                            return (
                              <button
                                onClick={() =>
                                  toggleBoolean(
                                    envValue.environment.id,
                                    isBoolValue,
                                  )
                                }
                                className="..."
                              >
                                Toggle
                              </button>
                            );
                          })()}
                        <button
                          onClick={() => handleEdit(envValue)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
