import { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';

interface ActivityItem {
  id: string;
  type: 'contact' | 'audit';
  message: string;
  timestamp: string;
  status?: string;
}

interface DashboardResponse {
  success: boolean;
  data: {
    metrics: {
      totalContacts: number;
      openRequests: number;
      closedRequests: number;
      administrators: number;
    };
    recentContacts: Array<{
      id: string;
      name: string;
      email: string;
      company: string | null;
      service: string | null;
      message: string;
      status: string;
      createdAt: string;
    }>;
    recentAuditLogs: Array<{
      id: string;
      event: string;
      actorName: string | null;
      details: string;
      ipAddress: string | null;
      severity: string;
      createdAt: string;
    }>;
  };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalContacts: 0,
    openRequests: 0,
    closedRequests: 0,
    administrators: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let active = true;

    async function fetchDashboard() {
      try {
        setError(null);
        const res = await apiClient.get<DashboardResponse>('/api/admin/dashboard');
        if (!active) return;

        if (res.success && res.data) {
          setMetrics(res.data.metrics);

          const mappedContacts = (res.data.recentContacts || []).map((c) => ({
            id: `contact-${c.id}`,
            type: 'contact' as const,
            message: `New contact submission from ${c.name} (${c.service || 'General Inquiry'})`,
            timestamp: new Date(c.createdAt).toLocaleString(),
            status: ['NEW', 'IN_PROGRESS'].includes(c.status) ? 'Open' : 'Closed',
            rawDate: new Date(c.createdAt),
          }));

          const mappedAudits = (res.data.recentAuditLogs || []).map((a) => ({
            id: `audit-${a.id}`,
            type: 'audit' as const,
            message: a.details,
            timestamp: new Date(a.createdAt).toLocaleString(),
            rawDate: new Date(a.createdAt),
          }));

          const sortedActivities = [...mappedContacts, ...mappedAudits]
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
            .slice(0, 5);

          setActivities(sortedActivities);
        } else {
          throw new Error('Failed to retrieve dashboard stats');
        }
      } catch (err) {
        if (!active) return;
        console.error('Error fetching dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">System Status Overview</h2>
        <p className="text-sm text-xifoz-text-secondary">Real-time indicators of client contacts and administration audits.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-xifoz-text-secondary">Total Contacts</span>
            <div className="p-2 rounded-lg bg-xifoz-blue/5 text-xifoz-blue">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-3xl font-semibold text-xifoz-text">{metrics.totalContacts}</div>
          )}
        </div>

        <div className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-xifoz-text-secondary">Open Requests</span>
            <div className="p-2 rounded-lg bg-xifoz-warning/5 text-xifoz-warning">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-3xl font-semibold text-xifoz-text">{metrics.openRequests}</div>
          )}
        </div>

        <div className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-xifoz-text-secondary">Closed Requests</span>
            <div className="p-2 rounded-lg bg-xifoz-success/5 text-xifoz-success">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-3xl font-semibold text-xifoz-text">{metrics.closedRequests}</div>
          )}
        </div>

        <div className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-xifoz-text-secondary">Administrators</span>
            <div className="p-2 rounded-lg bg-xifoz-structural/5 text-xifoz-structural">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-3xl font-semibold text-xifoz-text">{metrics.administrators}</div>
          )}
        </div>
      </div>

      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-xifoz-dim flex items-center justify-between">
          <h3 className="text-base font-semibold text-xifoz-text">Recent Activity</h3>
          <Link 
            to="/admin/audit" 
            className="text-xs font-medium text-xifoz-blue hover:text-xifoz-blue/80 flex items-center gap-1 transition-colors"
          >
            <span>View Full Audit Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-xifoz-dim">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3.5 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-xifoz-text font-medium truncate">{activity.message}</p>
                  <p className="text-xs text-xifoz-text-secondary mt-0.5">{activity.timestamp}</p>
                </div>
                {activity.status && (
                  <span className={`px-2.5 py-0.5 rounded-badge text-xs font-medium ${
                    activity.status === 'Open' 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                      : 'bg-green-50 text-green-700 border border-green-200/50'
                  }`}>
                    {activity.status}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-sm text-xifoz-text-secondary">
              No recent activity recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
