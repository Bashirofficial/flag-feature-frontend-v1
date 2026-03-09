import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';

export const CreateFlagPage: React.FC = () => {
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateKey = (value: string): string | null => {
    if (!value) return 'Flag key is required';
    if (!/^[a-z0-9_]+$/.test(value)) {
      return 'Flag key must be snake_case (lowercase letters, numbers, and underscores only)';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const keyError = validateKey(key);
    if (keyError) {
      setError(keyError);
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiService.createFlag({ key, description });
      navigate('/flags');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create flag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyChange = (value: string) => {
    setKey(value);
    setError('');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link to="/flags" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Flags
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create Feature Flag</h1>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded p-6">
          <div className="mb-4">
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
              Flag Key *
            </label>
            <input
              id="key"
              type="text"
              value={key}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder="enable_new_feature"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use snake_case (lowercase letters, numbers, and underscores)
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              placeholder="Describe what this flag controls"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Flag'}
            </button>
            <Link
              to="/flags"
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
