import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Administrator {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<Administrator[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAdmins([
        {
          id: '1',
          name: 'XIFOZ Admin',
          email: 'admin@xifoz.com',
          role: 'Super Administrator',
          status: 'Active',
          lastLogin: '10 mins ago',
        },
        {
          id: '2',
          name: 'Security Lead',
          email: 'lead@xifoz.com',
          role: 'Security Administrator',
          status: 'Active',
          lastLogin: '3 hours ago',
        },
        {
          id: '3',
          name: 'Audit Auditor',
          email: 'auditor@xifoz.com',
          role: 'Read-only Analyst',
          status: 'Active',
          lastLogin: '2 days ago',
        },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

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
                        {admin.role.includes('Super') && (
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
                        <span>{admin.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-xifoz-text-secondary">
                      {admin.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-badge text-xs font-semibold ${
                        admin.status === 'Active'
                          ? 'bg-green-50 text-green-700 border border-green-200/50'
                          : 'bg-gray-50 text-gray-700 border border-gray-200/50'
                      }`}>
                        {admin.status}
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
      </div>
    </div>
  );
}
