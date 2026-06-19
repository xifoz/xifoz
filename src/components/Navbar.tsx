import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { mainNavLinks } from '@/data/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-xifoz-base/80 backdrop-blur-xl border-b border-xifoz-text/5'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <path
                  d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M14 7L8 10.5V17.5L14 21L20 17.5V10.5L14 7Z"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  fill="none"
                />
                <circle cx="14" cy="14" r="2" fill="#2563EB" />
              </svg>
              <span className="text-lg font-semibold tracking-[0.15em] text-xifoz-text">
                XIFOZ
              </span>
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
                      ? 'text-xifoz-blue'
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
                className={cn(
                  'inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-pill transition-all duration-300 border',
                  'border-xifoz-text/15 text-xifoz-text hover:border-xifoz-blue hover:text-xifoz-blue'
                )}
              >
                Get Protection
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-xifoz-text hover:text-xifoz-blue transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] bg-xifoz-base lg:hidden"
          >
            <div className="flex flex-col h-full px-6 py-4">
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-12">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" stroke="#2563EB" strokeWidth="1.5" fill="none" />
                    <path d="M14 7L8 10.5V17.5L14 21L20 17.5V10.5L14 7Z" stroke="#38BDF8" strokeWidth="1" fill="none" />
                    <circle cx="14" cy="14" r="2" fill="#2563EB" />
                  </svg>
                  <span className="text-lg font-semibold tracking-[0.15em]">XIFOZ</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-xifoz-text hover:text-xifoz-blue transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col gap-6">
                {mainNavLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'text-2xl font-medium transition-colors duration-300',
                        location.pathname === link.href
                          ? 'text-xifoz-blue'
                          : 'text-xifoz-text hover:text-xifoz-blue'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile CTA */}
              <div className="mt-auto pb-8">
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-4 bg-xifoz-blue text-white rounded-pill font-medium text-lg"
                >
                  Get Protection
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
