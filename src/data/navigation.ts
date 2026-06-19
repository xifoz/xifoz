export interface NavLink {
  label: string;
  href: string;
}

export const mainNavLinks: NavLink[] = [
  { label: 'Services', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerLinks = {
  services: [
    { label: 'Penetration Testing', href: '/services' },
    { label: 'Vulnerability Assessment', href: '/services' },
    { label: 'Managed Security', href: '/services' },
    { label: 'SOC as a Service', href: '/services' },
    { label: 'Cloud Security', href: '/services' },
    { label: 'Incident Response', href: '/services' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};
