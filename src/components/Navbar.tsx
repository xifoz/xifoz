import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { mainNavLinks } from '@/data/navigation';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('touch-none');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('touch-none');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('touch-none');
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  // Close on route change — location.key changes on every navigation
  // Using location.key instead of .pathname handles same-route navigations too
  const lastKey = location.key;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [lastKey]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white pt-[env(safe-area-inset-top)]',
          isScrolled ? 'border-b border-xifoz-border py-0' : 'border-b border-transparent py-2'
        )}
      >
        <div className="mx-auto max-w-content px-4 sm:px-6 md:px-8 w-full">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" aria-label="XIFOZ home">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/logo.png"
                  alt="XIFOZ"
                  className="h-9 w-9 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="text-xl font-bold tracking-[0.12em] text-xifoz-text">
                  XIFOZ
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'text-sm font-medium uppercase tracking-[0.08em] transition-colors duration-300 link-underline',
                    location.pathname === link.href
                      ? 'text-xifoz-text'
                      : 'text-xifoz-text-secondary hover:text-xifoz-text'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-badge transition-all duration-300 bg-xifoz-text text-white hover:bg-black/80"
              >
                Get Protection
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-xifoz-text hover:opacity-80 transition-opacity"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — CSS-only animation, always in DOM */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!isMobileMenuOpen}
        className={cn(
          'fixed inset-0 z-[60] bg-xifoz-base lg:hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
          'transition-all duration-300 ease-in-out',
          isMobileMenuOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col h-full px-6 py-4">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu} aria-label="XIFOZ home">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/logo.png"
                  alt="XIFOZ"
                  className="h-9 w-9"
                />
                <span className="text-xl font-bold tracking-[0.12em] text-xifoz-text">
                  XIFOZ
                </span>
              </div>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-xifoz-text hover:opacity-80 transition-opacity"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <nav className="flex flex-col gap-6">
            {mainNavLinks.map((link, index) => (
              <div
                key={link.href}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${index * 0.07}s` : '0s',
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
              >
                <Link
                  to={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    'text-2xl font-medium transition-colors duration-300',
                    location.pathname === link.href
                      ? 'text-xifoz-text'
                      : 'text-xifoz-text hover:opacity-70'
                  )}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Mobile CTA */}
          <div className="mt-auto pb-8">
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="block w-full text-center py-4 bg-xifoz-text text-white rounded-badge font-medium text-lg"
            >
              Get Protection
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
