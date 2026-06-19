import { Link } from 'react-router-dom';
import { Container } from './Container';
import { footerLinks } from '@/data/navigation';
import { Separator } from '@/components/ui/separator';
import { ArrowUpRight, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-xifoz-base border-t border-xifoz-text/5">
      {/* Large CTA */}
      <Container className="py-24 md:py-32">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-text leading-tight tracking-tight mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-xifoz-text-secondary mb-8 leading-relaxed">
            Protect your organization with proactive cybersecurity solutions. Book a free consultation and discover how XIFOZ can strengthen your security posture.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-xifoz-blue text-white rounded-pill font-medium text-base hover:bg-blue-700 transition-colors duration-300"
          >
            Book a Free Consultation
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </Container>

      <Separator className="bg-xifoz-text/5" />

      {/* Links Grid */}
      <Container className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" stroke="#2563EB" strokeWidth="1.5" fill="none" />
                <path d="M14 7L8 10.5V17.5L14 21L20 17.5V10.5L14 7Z" stroke="#38BDF8" strokeWidth="1" fill="none" />
                <circle cx="14" cy="14" r="2" fill="#2563EB" />
              </svg>
              <span className="text-base font-semibold tracking-[0.15em]">XIFOZ</span>
            </Link>
            <p className="text-sm text-xifoz-text-secondary leading-relaxed">
              Protecting organizations from modern cyber threats through proactive cybersecurity services.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-xifoz-text mb-4">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.slice(0, 4).map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-xifoz-text-secondary hover:text-xifoz-text transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-xifoz-text mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-xifoz-text-secondary hover:text-xifoz-text transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-xifoz-text mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-xifoz-text-secondary hover:text-xifoz-text transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Separator className="bg-xifoz-text/5" />

      {/* Bottom */}
      <Container className="py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-xifoz-text-secondary">
            &copy; {new Date().getFullYear()} XIFOZ. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-xifoz-text-secondary hover:text-xifoz-blue transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-xifoz-text-secondary hover:text-xifoz-blue transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
