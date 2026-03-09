import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

interface Flag {
  id: string;
  key: string;
  description: string;
  createdAt: string;
}

export const FlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const data = await apiService.getFlags();
        setFlags(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flags');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlags();
  }, []);

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
        <h1 className="text-2xl font-semibold text-gray-900">Feature Flags</h1>
        <Link
          to="/flags/new"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
        >
          Create Flag
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {flags.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded p-8 text-center">
          <p className="text-sm text-gray-500">No feature flags yet.</p>
          <Link
            to="/flags/new"
            className="inline-block mt-3 text-sm text-gray-900 hover:underline"
          >
            Create your first flag
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Flag Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/flags/${flag.id}`}
                      className="text-sm font-mono text-gray-900 hover:underline"
                    >
                      {flag.key}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {flag.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
