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
    primary: 'bg-xifoz-text text-white hover:bg-black/80 shadow-sm border border-transparent',
    secondary: 'bg-white text-xifoz-text border border-xifoz-border hover:border-xifoz-text/20 shadow-sm',
    outline: 'bg-transparent border border-xifoz-border text-xifoz-text hover:border-xifoz-text/30 hover:bg-white',
    ghost: 'bg-transparent text-xifoz-text-secondary hover:bg-xifoz-dim hover:text-xifoz-text',
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
