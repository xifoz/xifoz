import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  className,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-badge tracking-wide';

  const variantClasses = {
    primary: 'bg-xifoz-blue text-white hover:bg-blue-600 shadow-sm hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-transparent transition-all duration-300',
    secondary: 'bg-xifoz-dark-dim text-xifoz-dark-text border border-xifoz-dark-border hover:bg-xifoz-dark-surface hover:border-xifoz-dark-text/20 shadow-sm transition-all duration-300',
    outline:
      'bg-transparent border border-xifoz-dark-border text-xifoz-dark-text hover:border-xifoz-dark-text/30 hover:bg-xifoz-dark-surface transition-all duration-300',
    ghost: 'bg-transparent text-xifoz-dark-text-muted hover:bg-xifoz-dark-dim hover:text-xifoz-dark-text transition-all duration-300',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], disabledClasses, className);

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
