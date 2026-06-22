import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ChevronDown, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPathMeta = () => {
    const path = location.pathname;
    if (path === '/admin') return { title: 'Dashboard', pageName: 'Dashboard' };
    if (path.startsWith('/admin/contacts')) return { title: 'Contacts', pageName: 'Contacts' };
    if (path.startsWith('/admin/users')) return { title: 'Administrators', pageName: 'Administrators' };
    if (path.startsWith('/admin/audit')) return { title: 'Audit Logs', pageName: 'Audit Logs' };
    if (path.startsWith('/admin/profile')) return { title: 'Profile', pageName: 'Profile' };
    if (path.startsWith('/admin/settings')) return { title: 'Settings', pageName: 'Settings' };
    return { title: 'Admin Not Found', pageName: '404' };
  };

  const { title, pageName } = getPathMeta();

  return (
    <header className="h-16 bg-xifoz-surface border-b border-xifoz-dim flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 text-xifoz-text-secondary hover:text-xifoz-text rounded-md focus-visible:ring-2 focus-visible:ring-xifoz-blue"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <nav className="text-xs text-xifoz-text-secondary mb-0.5" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 list-none p-0 m-0">
              <li>
                <span className="text-xifoz-text-secondary">Admin</span>
              </li>
              <li className="text-xifoz-text-secondary/40 select-none">/</li>
              <li>
                <span className="font-medium text-xifoz-text">{pageName}</span>
              </li>
            </ol>
          </nav>
          <h1 className="text-base font-semibold text-xifoz-text leading-none">{title}</h1>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-xifoz-dim transition-colors outline-none focus-visible:ring-2 focus-visible:ring-xifoz-blue"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          aria-label="Admin profile menu"
        >
          <div className="w-8 h-8 rounded-full bg-xifoz-blue text-white flex items-center justify-center font-semibold text-sm">
            {admin?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="hidden md:block text-sm font-medium text-xifoz-text">
            {admin?.name || 'Administrator'}
          </span>
          <ChevronDown className="w-4 h-4 text-xifoz-text-secondary" />
        </button>

        {isDropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-48 bg-xifoz-surface border border-xifoz-dim rounded-lg shadow-sm py-1 z-50 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="px-4 py-2 border-b border-xifoz-dim">
              <p className="text-xs text-xifoz-text-secondary truncate">Signed in as</p>
              <p className="text-sm font-medium text-xifoz-text truncate">{admin?.email}</p>
            </div>
            
            <Link
              to="/admin/profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-xifoz-text-secondary hover:text-xifoz-text hover:bg-xifoz-dim transition-colors"
              role="menuitem"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>

            <Link
              to="/admin/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-xifoz-text-secondary hover:text-xifoz-text hover:bg-xifoz-dim transition-colors"
              role="menuitem"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            <div className="border-t border-xifoz-dim my-1" />

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                logout();
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-xifoz-danger hover:bg-red-50 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
