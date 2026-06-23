import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Mail, 
  Shield, 
  ClipboardList, 
  User, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

function SidebarItem({ to, icon: Icon, label, onClick }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-xifoz-blue",
        isActive 
          ? "bg-xifoz-blue text-white" 
          : "text-xifoz-text-secondary hover:text-xifoz-text hover:bg-xifoz-dim"
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['SUPER_ADMIN', 'SECURITY_ADMIN', 'READ_ONLY'] },
    { to: '/admin/contacts', icon: Mail, label: 'Contacts', roles: ['SUPER_ADMIN', 'SECURITY_ADMIN', 'READ_ONLY'] },
    { to: '/admin/users', icon: Shield, label: 'Administrators', roles: ['SUPER_ADMIN'] },
    { to: '/admin/audit', icon: ClipboardList, label: 'Audit Logs', roles: ['SUPER_ADMIN', 'SECURITY_ADMIN', 'READ_ONLY'] },
    { to: '/admin/profile', icon: User, label: 'Profile', roles: ['SUPER_ADMIN', 'SECURITY_ADMIN', 'READ_ONLY'] },
    { to: '/admin/settings', icon: Settings, label: 'Settings', roles: ['SUPER_ADMIN'] },
  ];

  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role || ''));

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-xifoz-surface border-r border-xifoz-dim flex flex-col h-full transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-xifoz-dim">
          <Link to="/admin" className="flex items-center gap-2" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" stroke="#2563EB" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2" fill="#2563EB" />
            </svg>
            <span className="font-semibold text-lg tracking-wider text-xifoz-text">XIFOZ ADMIN</span>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-xifoz-text-secondary hover:text-xifoz-text rounded-md focus-visible:ring-2 focus-visible:ring-xifoz-blue"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              to={item.to} 
              icon={item.icon} 
              label={item.label} 
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Pinned Logout Action */}
        <div className="p-4 border-t border-xifoz-dim">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-xifoz-danger hover:bg-red-50 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-xifoz-danger"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
