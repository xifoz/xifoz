import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShieldAlert } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  ipAddress: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export default function AdminAudit() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs([
        {
          id: '1',
          timestamp: '2026-06-22 17:55:12',
          action: 'USER_LOGIN',
          user: 'admin@xifoz.com',
          details: 'Admin (admin@xifoz.com) logged in successfully from Firefox browser',
          ipAddress: '127.0.0.1',
          severity: 'Info',
        },
        {
          id: '2',
          timestamp: '2026-06-22 17:10:04',
          action: 'CONTACT_RESOLUTION',
          user: 'System',
          details: 'Contact request #24 marked as Resolved automatically by system daemon',
          ipAddress: '10.0.0.4',
          severity: 'Info',
        },
        {
          id: '3',
          timestamp: '2026-06-22 16:50:33',
          action: 'SETTINGS_UPDATE',
          user: 'admin@xifoz.com',
          details: 'Modified Global Rate Limiter settings in UI configuration panel',
          ipAddress: '192.168.1.42',
          severity: 'Warning',
        },
        {
          id: '4',
          timestamp: '2026-06-21 23:15:45',
          action: 'FAILED_LOGIN',
          user: 'unknown@xifoz.com',
          details: 'Failed authentication attempt: Invalid credentials provided',
          ipAddress: '185.220.101.5',
          severity: 'Critical',
        },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">System Audit Logs</h2>
        <p className="text-sm text-xifoz-text-secondary">Immutable trace records of administrator activities and critical backend system updates.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search logs by action, user, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-xifoz-base/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-xifoz-text-secondary flex items-center gap-1.5">
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
      </div>
    </div>
  );
}
