import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";

interface AuditLog {
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
}

interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAction, setFilterAction] = useState("");

  const fetchLogs = async (page: number, action?: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.getAuditLogs({ page, action });
      setLogs(response.logs);
      setPagination(response.pagination);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit logs",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, filterAction || undefined);
  }, [currentPage, filterAction]);

  const getActionIcon = (action: string) => {
    if (action.includes("CREATED")) {
      return (
        <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
          <svg
            className="w-5 h-5 text-white"
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
        </div>
      );
    }
    if (action.includes("UPDATED") || action.includes("VALUE")) {
      return (
        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
      );
    }
    if (action.includes("DELETED") || action.includes("REVOKED")) {
      return (
        <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATED"))
      return "bg-green-100 text-green-700 border-green-200";
    if (action.includes("UPDATED") || action.includes("VALUE"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (action.includes("DELETED") || action.includes("REVOKED"))
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-purple-100 text-purple-700 border-purple-200";
  };

  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 font-medium">
            Loading audit logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
          <p className="text-sm text-gray-500">
            Track all changes and activities in your organization
          </p>
        </div>

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
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Actions</option>
              <option value="FLAG_CREATED">Flag Created</option>
              <option value="FLAG_UPDATED">Flag Updated</option>
              <option value="FLAG_VALUE_UPDATED">Flag Value Updated</option>
              <option value="API_KEY_CREATED">API Key Created</option>
              <option value="API_KEY_REVOKED">API Key Revoked</option>
            </select>
            {pagination && (
              <span className="ml-auto text-sm text-gray-600">
                {logs.length} of {pagination.totalItems} logs
              </span>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No logs found
              </h3>
              <p className="text-sm text-gray-500">
                {filterAction
                  ? "Try changing the filter"
                  : "Activity will appear here"}
              </p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id}
                className="relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    <div className="shrink-0">{getActionIcon(log.action)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${getActionColor(log.action)}`}
                        >
                          {formatActionName(log.action)}
                        </span>
                        {log.environmentKey && (
                          <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-lg">
                            {log.environmentKey}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {log.resourceName || log.resourceType}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{log.userEmail}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      {log.changes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="text-xs font-medium text-gray-500 mb-2">
                            Changes:
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            {log.changes.before !== undefined && (
                              <div>
                                <div className="text-gray-500 mb-1">
                                  Before:
                                </div>
                                <div className="px-2 py-1 bg-red-50 text-red-900 rounded font-mono">
                                  {JSON.stringify(log.changes.before)}
                                </div>
                              </div>
                            )}
                            {log.changes.after !== undefined && (
                              <div>
                                <div className="text-gray-500 mb-1">After:</div>
                                <div className="px-2 py-1 bg-green-50 text-green-900 rounded font-mono">
                                  {JSON.stringify(log.changes.after)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < logs.length - 1 && (
                  <div className="absolute left-12.25 top-19 w-0.5 h-6 bg-gray-200"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
