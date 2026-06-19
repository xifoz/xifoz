import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Sword,
  ScanSearch,
  ShieldCheck,
  MonitorCheck,
  CloudCog,
  GlobeLock,
  Webhook,
  Network,
  Siren,
  FileCheck,
  ClipboardCheck,
  Users,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sword,
  ScanSearch,
  ShieldCheck,
  MonitorCheck,
  CloudCog,
  GlobeLock,
  Webhook,
  Network,
  Siren,
  FileCheck,
  ClipboardCheck,
  Users,
};

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
  compact?: boolean;
}

export function ServiceCard({ title, description, icon, className, compact = false }: ServiceCardProps) {
  const IconComponent = iconMap[icon] || ShieldCheck;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'group bg-xifoz-surface border border-xifoz-text/5 rounded-card p-6 md:p-8 transition-shadow duration-300 hover:shadow-card',
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-xifoz-blue/5 flex items-center justify-center mb-4 group-hover:bg-xifoz-blue/10 transition-colors duration-300">
        <IconComponent size={20} className="text-xifoz-blue" />
      </div>
      <h3 className="text-base font-semibold text-xifoz-text mb-2">{title}</h3>
      {!compact && (
        <p className="text-sm text-xifoz-text-secondary leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
