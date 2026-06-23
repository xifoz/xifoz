import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service: string | null;
  message: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

interface ContactsApiResponse {
  success: boolean;
  data: {
    items: Array<{
      id: string;
      name: string;
      email: string;
      company: string | null;
      service: string | null;
      message: string;
      status: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  };
}

export default function AdminContacts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    let active = true;

    async function fetchContacts() {
      try {
        setLoading(true);
        setError(null);
        
        // Build query string
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: searchTerm,
          status: statusFilter,
        });

        const response = await apiClient.get<ContactsApiResponse>(`/api/admin/contacts?${params.toString()}`);
        if (!active) return;

        if (response.success && response.data) {
          const mapped = response.data.items.map((item) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            company: item.company,
            service: item.service,
            message: item.message,
            status: ['NEW', 'IN_PROGRESS'].includes(item.status) ? ('Open' as const) : ('Closed' as const),
            createdAt: new Date(item.createdAt).toLocaleString(),
          }));
          setContacts(mapped);
          setTotal(response.data.total);
        } else {
          throw new Error('Failed to retrieve contact submissions');
        }
      } catch (err) {
        if (!active) return;
        console.error('Error loading contacts:', err);
        setError(err instanceof Error ? err.message : 'Error loading contacts');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    // Debounce search input slightly to prevent hitting backend on every keystroke
    const debounceTimer = setTimeout(() => {
      fetchContacts();
    }, 300);

    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [page, searchTerm, statusFilter]);

  // Reset to first page on search/filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as 'All' | 'Open' | 'Closed');
    setPage(1);
  };

  const handleToggleStatus = async (id: string, currentStatus: 'Open' | 'Closed') => {
    try {
      const nextBackendStatus = currentStatus === 'Open' ? 'RESOLVED' : 'IN_PROGRESS';
      
      const response = await apiClient.patch<{ success: boolean }>(`/api/admin/contacts/${id}`, {
        status: nextBackendStatus,
      });

      if (response.success) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status: currentStatus === 'Open' ? 'Closed' : 'Open' }
              : c
          )
        );
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error toggling contact status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update contact status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">Contact Submissions</h2>
        <p className="text-sm text-xifoz-text-secondary">View and manage form entries submitted by website visitors.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search contacts by name, email, company, service..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-3 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-xifoz-dim text-xifoz-text font-medium border-b border-xifoz-dim">
              <tr>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Company & Service</th>
                <th className="px-6 py-3">Submission Details</th>
                <th className="px-6 py-3">Date</th>
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
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-56" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded" />
                    </td>
                  </tr>
                ))
              ) : contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-xifoz-base/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-xifoz-text">{contact.name}</div>
                      <div className="text-xs text-xifoz-text-secondary flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{contact.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xifoz-text font-medium">{contact.company || 'N/A'}</div>
                      <div className="text-xs text-xifoz-blue font-semibold mt-0.5">{contact.service || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xifoz-text-secondary text-xs line-clamp-2" title={contact.message}>
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-xifoz-text-secondary">
                      <span>{contact.createdAt}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(contact.id, contact.status)}
                        disabled={user?.role === 'READ_ONLY'}
                        className={`px-2.5 py-1 rounded-badge text-xs font-semibold border transition-all ${
                          user?.role === 'READ_ONLY'
                            ? 'opacity-60 cursor-not-allowed border-xifoz-dim bg-xifoz-dim text-xifoz-text-secondary'
                            : 'cursor-pointer hover:opacity-80 ' + (
                                contact.status === 'Open'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                  : 'bg-green-50 text-green-700 border-green-200/50'
                              )
                        }`}
                        title={user?.role === 'READ_ONLY' ? 'Read-only access' : 'Click to toggle status'}
                      >
                        {contact.status}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-xifoz-text-secondary">
                    No submissions match your search or filters.
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
