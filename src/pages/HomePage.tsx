import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface Organization {
  id: string;
  name: string;
  environments: Array<{ id: string; name: string; key: string }>;
}

interface Stats {
  totalFlags: number;
  totalApiKeys: number;
  activeApiKeys: number;
}

export const HomePage: React.FC = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgData, statsData] = await Promise.all([
          apiService.getOrganization(),
          apiService.getStats(),
        ]);
        setOrganization(orgData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {organization?.name || 'Dashboard'}
      </h1>

      {/* Environments */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Environments</h2>
        <div className="flex gap-3">
          {organization?.environments.map((env) => (
            <div
              key={env.id}
              className="px-4 py-3 bg-white border border-gray-200 rounded"
            >
              <div className="text-sm font-medium text-gray-900">{env.name}</div>
              <div className="text-xs text-gray-500 mt-1">{env.key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-3">Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {stats?.totalFlags || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Flags</div>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {stats?.totalApiKeys || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total API Keys</div>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {stats?.activeApiKeys || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active API Keys</div>
          </div>
        </div>
      </div>
    </div>
  );
};
