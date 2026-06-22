import { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  type: 'contact' | 'audit';
  message: string;
  timestamp: string;
  status?: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalContacts: 0,
    openRequests: 0,
    closedRequests: 0,
    administrators: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMetrics({
        totalContacts: 48,
        openRequests: 12,
        closedRequests: 36,
        administrators: 3,
      });

      setActivities([
        {
          id: '1',
          type: 'contact',
          message: 'New contact submission from John Doe (Penetration Testing)',
          timestamp: '10 mins ago',
          status: 'Open',
        },
        {
          id: '2',
          type: 'audit',
          message: 'Admin (admin@xifoz.com) logged in successfully',
          timestamp: '45 mins ago',
        },
        {
          id: '3',
          type: 'contact',
          message: 'Contact request #24 marked as Resolved by System',
          timestamp: '2 hours ago',
          status: 'Closed',
        },
        {
          id: '4',
          type: 'contact',
          message: 'New contact submission from Sarah Connor (Incident Response)',
          timestamp: '4 hours ago',
          status: 'Open',
        },
        {
          id: '5',
          type: 'audit',
          message: 'System configuration updated: API rate limiter settings modified',
          timestamp: '1 day ago',
        },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">System Status Overview</h2>
        <p className="text-sm text-xifoz-text-secondary">Real-time indicators of client contacts and administration audits.</p>
      </div>

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
