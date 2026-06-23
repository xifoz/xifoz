import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShieldAlert, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

interface AuditApiResponse {
  success: boolean;
  data: {
    items: Array<{
      id: string;
      event: string;
      actorName: string | null;
      details: string;
      ipAddress: string | null;
      severity: string;
      createdAt: string;
      admin?: {
        name: string;
        email: string;
      } | null;
    }>;
    total: number;
    page: number;
    limit: number;
  };
}

export default function AdminAudit() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    let active = true;

    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: searchTerm,
        });

        const response = await apiClient.get<AuditApiResponse>(`/api/admin/audit-logs?${params.toString()}`);
        if (!active) return;

        if (response.success && response.data) {
          const mapped = response.data.items.map((log) => {
            const sev = log.severity.toUpperCase();
            let normSeverity: 'Info' | 'Warning' | 'Critical' = 'Info';
            if (sev === 'WARNING') normSeverity = 'Warning';
            if (sev === 'CRITICAL') normSeverity = 'Critical';

            return {
              id: log.id,
              timestamp: new Date(log.createdAt).toLocaleString(),
              action: log.event,
              user: log.actorName || log.admin?.email || 'System',
              details: log.details,
              ipAddress: log.ipAddress || 'N/A',
              severity: normSeverity,
            };
          });
          setLogs(mapped);
          setTotal(response.data.total);
        } else {
          throw new Error('Failed to retrieve system audit logs');
        }
      } catch (err) {
        if (!active) return;
        console.error('Error fetching audit logs:', err);
        setError(err instanceof Error ? err.message : 'Error fetching audit logs');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [page, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">System Audit Logs</h2>
        <p className="text-sm text-xifoz-text-secondary">Immutable trace records of administrator activities and critical backend system updates.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search logs by action, user, details, or IP..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
          />
        </div>
      </div>

      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-xifoz-dim text-xifoz-text font-medium border-b border-xifoz-dim">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action & User</th>
                <th className="px-6 py-3">Event Details</th>
                <th className="px-6 py-3">Source IP</th>
                <th className="px-6 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-xifoz-dim">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3.5 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-64" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded" />
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-xifoz-base/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-xifoz-text-secondary">
                      <span>{log.timestamp}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-xifoz-text text-xs">{log.action}</div>
                      <div className="text-xs text-xifoz-text-secondary mt-0.5">{log.user}</div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xifoz-text-secondary text-xs">{log.details}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-xifoz-text-secondary">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1 w-fit ${
                        log.severity === 'Info'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                          : log.severity === 'Warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                          : 'bg-red-50 text-red-700 border border-red-200/50'
                      }`}>
                        {log.severity === 'Critical' && <ShieldAlert className="w-3 h-3" />}
                        <span>{log.severity}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-xifoz-text-secondary">
                    No audit records match your search query.
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
              className="px-3 py-1.5 bg-xifoz-surface border border-xifoz-dim rounded text-xs text-xifoz-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-xifoz-dim/20 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-xifoz-text-secondary">
              Page {page} of {Math.ceil(total / limit) || 1} ({total} total)
            </span>
            <button
              onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
              disabled={page * limit >= total}
              className="px-3 py-1.5 bg-xifoz-surface border border-xifoz-dim rounded text-xs text-xifoz-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-xifoz-dim/20 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
