import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail } from 'lucide-react';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

export default function AdminContacts() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setContacts([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@company.com',
          company: 'Acme Corp',
          service: 'Penetration Testing',
          message: 'We need an external penetration test performed on our web apps and cloud infrastructure. Please send us your pricing.',
          status: 'Open',
          createdAt: '2026-06-22 15:30',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@tech.io',
          company: 'Tech Solutions LLC',
          service: 'Cloud Security',
          message: 'Interested in securing our AWS accounts and doing a vulnerability assessment. Looking for compliance support.',
          status: 'Closed',
          createdAt: '2026-06-21 11:20',
        },
        {
          id: '3',
          name: 'Sarah Connor',
          email: 'sarah@cyberdyne.net',
          company: 'Cyberdyne Systems',
          service: 'Incident Response',
          message: 'Urgent: We suspect a persistent active threat inside our corporate network. Need an immediate response team.',
          status: 'Open',
          createdAt: '2026-06-22 12:10',
        },
        {
          id: '4',
          name: 'Bruce Wayne',
          email: 'bruce@waynecorp.com',
          company: 'Wayne Enterprises',
          service: 'SOC as a Service',
          message: 'Looking for a comprehensive 24/7 Security Operations Center monitoring solution for our global offices.',
          status: 'Closed',
          createdAt: '2026-06-20 09:15',
        },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">Contact Submissions</h2>
        <p className="text-sm text-xifoz-text-secondary">View and manage form entries submitted by website visitors.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Open' | 'Closed')}
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
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-xifoz-base/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-xifoz-text">{contact.name}</div>
                      <div className="text-xs text-xifoz-text-secondary flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{contact.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xifoz-text font-medium">{contact.company}</div>
                      <div className="text-xs text-xifoz-blue font-semibold mt-0.5">{contact.service}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xifoz-text-secondary text-xs line-clamp-2" title={contact.message}>
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-xifoz-text-secondary flex items-center gap-1.5">
                      <span>{contact.createdAt}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-badge text-xs font-semibold ${
                        contact.status === 'Open'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                          : 'bg-green-50 text-green-700 border border-green-200/50'
                      }`}>
                        {contact.status}
                      </span>
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
      </div>
    </div>
  );
}
