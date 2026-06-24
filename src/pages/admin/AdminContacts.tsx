import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Mail, AlertCircle, Trash2, RotateCcw, FileText, X, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────

type ContactStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED' | 'SPAM';
type StatusFilter = 'ALL' | ContactStatus | 'BIN';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string;
  status: ContactStatus;
  internalNotes: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

interface ContactsApiResponse {
  success: boolean;
  data: {
    items: Array<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      company: string | null;
      service: string | null;
      message: string;
      status: string;
      internalNotes: string | null;
      isDeleted: boolean;
      deletedAt: string | null;
      createdAt: string;
    }>;
    total: number;
    page: number;
    limit: number;
  };
}

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContactStatus, { label: string; className: string }> = {
  NEW: {
    label: 'New',
    className: 'bg-blue-50 text-blue-700 border-blue-200/60',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 border-amber-200/60',
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'bg-green-50 text-green-700 border-green-200/60',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-gray-100 text-gray-600 border-gray-200/60',
  },
  SPAM: {
    label: 'Spam',
    className: 'bg-red-50 text-red-700 border-red-200/60',
  },
};

const ALL_STATUSES: ContactStatus[] = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED', 'SPAM'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContactStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-badge text-xs font-semibold border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

interface StatusDropdownProps {
  contactId: string;
  currentStatus: ContactStatus;
  disabled: boolean;
  onUpdate: (id: string, status: ContactStatus) => void;
}

function StatusDropdown({ contactId, currentStatus, disabled, onUpdate }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Position the portal menu below the trigger button
  const openMenu = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      minWidth: Math.max(rect.width, 130),
      zIndex: 9999,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    function handleClose(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleScroll() { setOpen(false); }
    document.addEventListener('mousedown', handleClose);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open]);

  if (disabled) {
    return <StatusBadge status={currentStatus} />;
  }

  const cfg = STATUS_CONFIG[currentStatus];

  return (
    <>
      <button
        ref={btnRef}
        id={`status-btn-${contactId}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-badge text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${cfg.className}`}
        title="Click to change status"
      >
        {cfg.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="bg-xifoz-surface border border-xifoz-dim rounded-lg shadow-xl py-1"
        >
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              id={`status-option-${contactId}-${s}`}
              onClick={() => {
                setOpen(false);
                if (s !== currentStatus) onUpdate(contactId, s);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-xifoz-dim/50 transition-colors ${
                s === currentStatus ? 'opacity-50 cursor-default' : 'cursor-pointer'
              }`}
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

interface ConfirmModalProps {
  contactName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmBinModal({ contactName, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-xifoz-text">Move to Bin</h3>
            <p className="text-xs text-xifoz-text-secondary mt-1">
              Move <span className="font-medium text-xifoz-text">{contactName}</span> to the bin?
              It will be auto-purged after 10 days.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            id="confirm-bin-cancel"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-xifoz-text-secondary bg-xifoz-dim border border-xifoz-dim rounded-lg hover:bg-xifoz-dim/70 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-bin-confirm"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Move to Bin
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotesModalProps {
  contactName: string;
  currentNotes: string | null;
  onSave: (notes: string) => void;
  onCancel: () => void;
  saving: boolean;
}

function NotesModal({ contactName, currentNotes, onSave, onCancel, saving }: NotesModalProps) {
  const [draft, setDraft] = useState(currentNotes ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-xifoz-blue" />
            <h3 className="text-sm font-semibold text-xifoz-text">Internal Notes</h3>
          </div>
          <button
            id="notes-modal-close"
            onClick={onCancel}
            className="text-xifoz-text-secondary hover:text-xifoz-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-xifoz-text-secondary mb-3">
          Notes for <span className="font-medium text-xifoz-text">{contactName}</span> — visible only to admins.
        </p>
        <textarea
          id="notes-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          placeholder="Add internal notes…"
          className="w-full px-3 py-2 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/40 transition-colors resize-none"
        />
        <div className="flex gap-3 justify-end mt-4">
          <button
            id="notes-modal-cancel"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-xifoz-text-secondary bg-xifoz-dim border border-xifoz-dim rounded-lg hover:bg-xifoz-dim/70 transition-colors"
          >
            Cancel
          </button>
          <button
            id="notes-modal-save"
            onClick={() => onSave(draft)}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-white bg-xifoz-blue rounded-lg hover:bg-xifoz-blue/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminContacts() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'READ_ONLY';

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  // Modal state
  const [binTarget, setBinTarget] = useState<ContactRequest | null>(null);
  const [notesTarget, setNotesTarget] = useState<ContactRequest | null>(null);
  const [notesSaving, setNotesSaving] = useState(false);

  const isBinView = statusFilter === 'BIN';

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    async function fetchContacts() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: searchTerm,
          status: statusFilter,
        });

        const response = await apiClient.get<ContactsApiResponse>(
          `/api/admin/contacts?${params.toString()}`
        );
        if (!active) return;

        if (response.success && response.data) {
          const mapped: ContactRequest[] = response.data.items.map((item) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone ?? null,
            company: item.company,
            service: item.service,
            message: item.message,
            status: (ALL_STATUSES.includes(item.status as ContactStatus)
              ? item.status
              : 'NEW') as ContactStatus,
            internalNotes: item.internalNotes ?? null,
            isDeleted: item.isDeleted,
            deletedAt: item.deletedAt ?? null,
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
        if (active) setLoading(false);
      }
    }

    const debounceTimer = setTimeout(fetchContacts, 300);
    return () => {
      active = false;
      clearTimeout(debounceTimer);
    };
  }, [page, searchTerm, statusFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setPage(1);
  };

  const handleUpdateStatus = async (id: string, newStatus: ContactStatus) => {
    try {
      const response = await apiClient.patch<{ success: boolean }>(
        `/api/admin/contacts/${id}`,
        { status: newStatus }
      );
      if (response.success) {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating contact status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update contact status');
    }
  };

  const handleMoveToBin = async (contact: ContactRequest) => {
    setBinTarget(contact);
  };

  const confirmMoveToBin = async () => {
    if (!binTarget) return;
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/api/admin/contacts/${binTarget.id}`
      );
      if (response.success) {
        setContacts((prev) => prev.filter((c) => c.id !== binTarget.id));
        setTotal((t) => Math.max(t - 1, 0));
      } else {
        throw new Error('Failed to move contact to bin');
      }
    } catch (err) {
      console.error('Error moving contact to bin:', err);
      alert(err instanceof Error ? err.message : 'Failed to move contact to bin');
    } finally {
      setBinTarget(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await apiClient.patch<{ success: boolean }>(
        `/api/admin/contacts/${id}/restore`,
        {}
      );
      if (response.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        setTotal((t) => Math.max(t - 1, 0));
      } else {
        throw new Error('Failed to restore contact');
      }
    } catch (err) {
      console.error('Error restoring contact:', err);
      alert(err instanceof Error ? err.message : 'Failed to restore contact');
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Permanently delete "${name}"? This cannot be undone.`
      )
    )
      return;
    try {
      const response = await apiClient.delete<{ success: boolean }>(
        `/api/admin/contacts/${id}/permanent`
      );
      if (response.success) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        setTotal((t) => Math.max(t - 1, 0));
      } else {
        throw new Error('Failed to permanently delete contact');
      }
    } catch (err) {
      console.error('Error permanently deleting contact:', err);
      alert(err instanceof Error ? err.message : 'Failed to permanently delete contact');
    }
  };

  const handleSaveNotes = async (notes: string) => {
    if (!notesTarget) return;
    setNotesSaving(true);
    try {
      const response = await apiClient.patch<{ success: boolean; data?: { internalNotes: string | null } }>(
        `/api/admin/contacts/${notesTarget.id}/notes`,
        { internalNotes: notes }
      );
      if (response.success) {
        const saved = notes.trim() || null;
        setContacts((prev) =>
          prev.map((c) =>
            c.id === notesTarget.id ? { ...c, internalNotes: saved } : c
          )
        );
        setNotesTarget(null);
      } else {
        throw new Error('Failed to save notes');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      alert(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setNotesSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const colCount = isBinView ? 6 : 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">
          {isBinView ? 'Bin' : 'Contact Submissions'}
        </h2>
        <p className="text-sm text-xifoz-text-secondary">
          {isBinView
            ? 'Soft-deleted leads. Items are auto-purged after 10 days.'
            : 'View and manage form entries submitted by website visitors.'}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="contacts-search"
            type="text"
            placeholder="Search by name, email, company, service…"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
          />
        </div>

        <select
          id="contacts-status-filter"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="px-3 py-2 bg-xifoz-surface border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ARCHIVED">Archived</option>
          <option value="SPAM">Spam</option>
          <option value="BIN">🗑 Bin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-xifoz-dim text-xifoz-text font-medium border-b border-xifoz-dim">
              <tr>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Company &amp; Service</th>
                <th className="px-6 py-3">Message</th>
                {!isBinView && <th className="px-6 py-3">Notes</th>}
                <th className="px-6 py-3">Date</th>
                {!isBinView && <th className="px-6 py-3">Status</th>}
                <th className="px-6 py-3">Actions</th>
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
                    {!isBinView && (
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    {!isBinView && (
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-20 rounded" />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-24 rounded" />
                    </td>
                  </tr>
                ))
              ) : contacts.length > 0 ? (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-xifoz-base/30 transition-colors">
                    {/* Contact info */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-xifoz-text">{contact.name}</div>
                      <div className="text-xs text-xifoz-text-secondary flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone ? (
                        <div className="text-xs text-xifoz-text-secondary mt-0.5">{contact.phone}</div>
                      ) : (
                        <div className="text-xs text-xifoz-text-secondary/40 italic mt-0.5">No phone</div>
                      )}
                    </td>

                    {/* Company & Service */}
                    <td className="px-6 py-4">
                      <div className="text-xifoz-text font-medium">{contact.company || 'N/A'}</div>
                      <div className="text-xs text-xifoz-blue font-semibold mt-0.5">
                        {contact.service || 'N/A'}
                      </div>
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4 max-w-xs">
                      <p
                        className="text-xifoz-text-secondary text-xs line-clamp-2"
                        title={contact.message}
                      >
                        {contact.message}
                      </p>
                    </td>

                    {/* Notes (hidden in BIN view) */}
                    {!isBinView && (
                      <td className="px-6 py-4 max-w-[160px]">
                        {contact.internalNotes ? (
                          <p
                            className="text-xifoz-text-secondary text-xs line-clamp-2 italic"
                            title={contact.internalNotes}
                          >
                            {contact.internalNotes}
                          </p>
                        ) : (
                          <span className="text-xs text-xifoz-text-secondary/30 italic">No notes</span>
                        )}
                      </td>
                    )}

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-xifoz-text-secondary">
                      {contact.createdAt}
                      {isBinView && contact.deletedAt && (
                        <div className="text-red-400 mt-0.5">
                          Deleted: {new Date(contact.deletedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Status (hidden in BIN view) */}
                    {!isBinView && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown
                          contactId={contact.id}
                          currentStatus={contact.status}
                          disabled={isReadOnly}
                          onUpdate={handleUpdateStatus}
                        />
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isBinView ? (
                        <div className="flex items-center gap-2">
                          <button
                            id={`restore-${contact.id}`}
                            onClick={() => handleRestore(contact.id)}
                            disabled={isReadOnly}
                            title="Restore"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200/60 rounded-badge hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore
                          </button>
                          <button
                            id={`perm-delete-${contact.id}`}
                            onClick={() => handlePermanentDelete(contact.id, contact.name)}
                            disabled={isReadOnly}
                            title="Delete permanently"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200/60 rounded-badge hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            id={`edit-notes-${contact.id}`}
                            onClick={() => setNotesTarget(contact)}
                            disabled={isReadOnly}
                            title="Edit internal notes"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-xifoz-text-secondary bg-xifoz-dim border border-xifoz-dim rounded-badge hover:bg-xifoz-dim/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            Notes
                          </button>
                          <button
                            id={`bin-${contact.id}`}
                            onClick={() => handleMoveToBin(contact)}
                            disabled={isReadOnly}
                            title="Move to bin"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200/60 rounded-badge hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Bin
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-6 py-10 text-center text-sm text-xifoz-text-secondary"
                  >
                    {isBinView
                      ? 'The bin is empty.'
                      : 'No submissions match your search or filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="px-6 py-4 bg-xifoz-dim border-t border-xifoz-dim flex items-center justify-between">
            <button
              id="contacts-prev-page"
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
              id="contacts-next-page"
              onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
              disabled={page * limit >= total}
              className="px-3 py-1.5 bg-xifoz-surface border border-xifoz-dim rounded text-xs text-xifoz-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-xifoz-dim/20 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirm Bin Modal */}
      {binTarget && (
        <ConfirmBinModal
          contactName={binTarget.name}
          onConfirm={confirmMoveToBin}
          onCancel={() => setBinTarget(null)}
        />
      )}

      {/* Notes Modal */}
      {notesTarget && (
        <NotesModal
          contactName={notesTarget.name}
          currentNotes={notesTarget.internalNotes}
          onSave={handleSaveNotes}
          onCancel={() => setNotesTarget(null)}
          saving={notesSaving}
        />
      )}
    </div>
  );
}
