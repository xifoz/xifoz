import { cn } from '@/lib/utils';
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
import type { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ size?: number; className?: string }>> = {
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
    <div
      className={cn(
        'group bg-white border border-xifoz-border rounded-card p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-xifoz-text/20 hover:bg-xifoz-dim/50',
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-xifoz-dim flex items-center justify-center mb-4 transition-colors duration-300">
        <IconComponent size={20} className="text-xifoz-text" />
      </div>
      <h3 className="text-base font-semibold text-xifoz-text mb-2">{title}</h3>
      {!compact && (
        <p className="text-sm text-xifoz-text-secondary leading-relaxed">{description}</p>
      )}
    </div>
  );
}
