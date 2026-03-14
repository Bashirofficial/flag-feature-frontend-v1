import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiService } from "../services/api";

type FlagValue = string | number | boolean | Record<string, unknown> | null;

interface EnvironmentValue {
  value: FlagValue;
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
  const [savingEnv, setSavingEnv] = useState<string | null>(null);

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
    const value =
      typeof envValue.value === "object"
        ? JSON.stringify(envValue.value, null, 2)
        : String(envValue.value);
    setEditValue(value);
    setSuccessMessage("");
  };

  const handleSave = async (environmentId: string) => {
    if (!flagId) return;

    setSavingEnv(environmentId);
    try {
      let parsedValue: FlagValue = editValue;

      // Try to parse JSON
      if (
        editValue.trim().startsWith("{") ||
        editValue.trim().startsWith("[")
      ) {
        try {
          parsedValue = JSON.parse(editValue);
        } catch {
          // Not JSON, continue
        }
      } else if (editValue.toLowerCase() === "true") {
        parsedValue = true;
      } else if (editValue.toLowerCase() === "false") {
        parsedValue = false;
      } else if (!isNaN(Number(editValue))) {
        parsedValue = Number(editValue);
      }

      await apiService.updateFlagEnvironmentValue(
        flagId,
        environmentId,
        parsedValue,
      );

      setEditingEnv(null);
      setSuccessMessage("Value updated successfully");
      await fetchFlag();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update value");
    } finally {
      setSavingEnv(null);
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

    setSavingEnv(environmentId);
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
    } finally {
      setSavingEnv(null);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      BOOLEAN: "bg-blue-100 text-blue-700 border-blue-200",
      STRING: "bg-purple-100 text-purple-700 border-purple-200",
      NUMBER: "bg-green-100 text-green-700 border-green-200",
      JSON: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const renderValue = (value: FlagValue) => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">
            Loading flag details...
          </p>
        </div>
      </div>
    );
  }

  if (!flag) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-red-50 via-white to-red-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Flag not found
          </h3>
          <p className="text-sm text-gray-600 text-center mb-6">
            The feature flag you're looking for doesn't exist.
          </p>
          <Link
            to="/flags"
            className="block w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 text-center"
          >
            Back to Flags
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Back Button */}
        <Link
          to="/flags"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Flags
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold font-mono text-gray-900">
                  {flag.key}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${getTypeColor(flag.type)}`}
                >
                  {flag.type}
                </span>
                {flag.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Inactive
                  </span>
                )}
              </div>
              {flag.name && (
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {flag.name}
                </p>
              )}
              <p className="text-sm text-gray-600 mb-4">{flag.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Created {new Date(flag.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Updated {new Date(flag.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-green-900">
              {successMessage}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        )}

        {/* Environment Values */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Environment Values
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {flag.environmentValues.map((envValue) => (
              <div
                key={envValue.environment.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {envValue.environment.name}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-lg">
                          {envValue.environment.key}
                        </span>
                      </div>

                      {editingEnv === envValue.environment.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={typeof envValue.value === "object" ? 6 : 2}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleSave(envValue.environment.id)
                              }
                              disabled={savingEnv === envValue.environment.id}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                            >
                              {savingEnv === envValue.environment.id
                                ? "Saving..."
                                : "Save Changes"}
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div
                            className={`flex-1 px-4 py-3 rounded-xl font-mono text-sm ${
                              typeof envValue.value === "object"
                                ? "bg-gray-50 border border-gray-200"
                                : "bg-gray-50"
                            }`}
                          >
                            {typeof envValue.value === "object" ? (
                              <pre className="text-gray-900 whitespace-pre-wrap">
                                {renderValue(envValue.value)}
                              </pre>
                            ) : (
                              <span className="text-gray-900">
                                {renderValue(envValue.value)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {typeof envValue.value === "boolean" &&
                              (() => {
                                const isBoolValue = envValue.value;
                                return (
                                  <button
                                    onClick={() =>
                                      toggleBoolean(
                                        envValue.environment.id,
                                        isBoolValue,
                                      )
                                    }
                                    disabled={
                                      savingEnv === envValue.environment.id
                                    }
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                      envValue.value
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    } ${savingEnv === envValue.environment.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <span
                                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                                        envValue.value
                                          ? "translate-x-7"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                );
                              })()}
                            <button
                              onClick={() => handleEdit(envValue)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
