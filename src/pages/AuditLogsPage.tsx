import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface AuditLog {
  id: string;
  action: string;
  target: string;
  environment: string;
  timestamp: string;
  userId: string;
  userEmail: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async (page: number, action?: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.getAuditLogs({
        page,
        action: action || undefined,
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, actionFilter);
  }, [currentPage, actionFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (action: string) => {
    setActionFilter(action);
    setCurrentPage(1);
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="p-8">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Audit Logs</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Action
        </label>
        <select
          id="action-filter"
          value={actionFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Actions</option>
          <option value="flag_created">Flag Created</option>
          <option value="flag_updated">Flag Updated</option>
          <option value="api_key_created">API Key Created</option>
          <option value="api_key_revoked">API Key Revoked</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden mb-4">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Environment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {log.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{log.target}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.environment}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.userEmail}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
