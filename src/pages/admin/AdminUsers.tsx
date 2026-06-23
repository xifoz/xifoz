import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { ROLE_LABELS, STATUS_LABELS, STATUS_COLORS, formatLastLogin } from '@/lib/admin';

interface AdminListItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
  createdAt: string;
  lastLoginAt: string | null;
}

interface UsersApiResponse {
  success: boolean;
  data: AdminListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Search, pagination and sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'createdAt' | 'lastLoginAt' | 'name'>('createdAt');
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchAdmins = useCallback(async (active = true) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchTerm,
        sort: sort,
      });

      const response = await apiClient.get<UsersApiResponse>(`/api/admin/users?${params.toString()}`);
      
      if (!active) return;

      if (response.success && response.data) {
        setAdmins(response.data);
        setTotal(response.pagination.total);
      } else {
        throw new Error('Failed to retrieve administrator list');
      }
    } catch (err) {
      if (!active) return;
      console.error('Error loading administrators:', err);
      setError('Unable to load administrator list.');
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }, [page, searchTerm, sort]);

  useEffect(() => {
    let active = true;

    const debounceTimer = setTimeout(() => {
      fetchAdmins(active);
    }, 300);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [fetchAdmins]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as 'createdAt' | 'lastLoginAt' | 'name');
    setPage(1);
  };

  const handleRefresh = () => {
    fetchAdmins(true);
  };

  const handleRetry = () => {
    fetchAdmins(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-normal text-xifoz-text tracking-tight">Administrators</h2>
          <p className="text-sm text-xifoz-text-secondary">Manage administrative accounts and security clearance permissions.</p>
        </div>
        <Button className="bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg flex items-center gap-1.5 text-xs py-2 px-3">
          <Plus className="w-4 h-4" />
          <span>Add Administrator</span>
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm font-medium mr-2">{error}</span>
            <button
              onClick={handleRetry}
              className="text-sm font-semibold underline hover:text-xifoz-danger/80 cursor-pointer ml-1 focus:outline-none"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search administrators by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={handleSortChange}
            className="px-3 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 cursor-pointer"
          >
            <option value="createdAt">Sort: Created Date</option>
            <option value="name">Sort: Name</option>
            <option value="lastLoginAt">Sort: Last Active</option>
          </select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-xifoz-dim hover:bg-xifoz-dim/20 text-xifoz-text rounded-lg flex items-center gap-1.5 text-xs py-2 px-3 h-[38px] cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-xifoz-dim text-xifoz-text font-medium border-b border-xifoz-dim">
              <tr>
                <th className="px-6 py-3">Administrator</th>
                <th className="px-6 py-3">Clearance Level / Role</th>
                <th className="px-6 py-3">Last Active Session</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-xifoz-dim">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded" />
                    </td>
                  </tr>
                ))
              ) : admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-xifoz-base/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-xifoz-text flex items-center gap-2">
                        <span>{admin.name}</span>
                        {admin.role === 'SUPER_ADMIN' && (
                          <span className="p-0.5 rounded bg-xifoz-blue/5 text-xifoz-blue text-[10px] font-semibold tracking-wide uppercase">
                            Root
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-xifoz-text-secondary mt-0.5">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xifoz-text font-medium text-xs flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-xifoz-text-secondary" />
                        <span>{ROLE_LABELS[admin.role]}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-xifoz-text-secondary">
                      {formatLastLogin(admin.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-badge text-xs font-semibold ${STATUS_COLORS[admin.status]}`}>
                        {STATUS_LABELS[admin.status]}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-xifoz-text-secondary">
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {total > limit && (
          <div className="px-6 py-4 bg-xifoz-dim border-t border-xifoz-dim flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-xifoz-surface border border-xifoz-dim rounded text-xs text-xifoz-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-xifoz-dim/20 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-xifoz-text-secondary">
              Page {page} of {Math.ceil(total / limit) || 1} ({total} total)
            </span>
            <button
              onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
              disabled={page * limit >= total}
              className="px-3 py-1.5 bg-xifoz-surface border border-xifoz-dim rounded text-xs text-xifoz-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-xifoz-dim/20 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
