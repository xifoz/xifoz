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
    'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-pill tracking-wide';

  const variantClasses = {
    primary: 'bg-xifoz-blue text-white hover:bg-blue-700 shadow-sm hover:shadow-md',
    secondary: 'bg-xifoz-structural text-xifoz-text-inverse hover:bg-gray-800 shadow-sm',
    outline:
      'bg-transparent border border-xifoz-text/20 text-xifoz-text hover:border-xifoz-blue hover:text-xifoz-blue',
    ghost: 'bg-transparent text-xifoz-text hover:bg-xifoz-text/5',
  };

  const sizeClasses = {
    sm: 'px-5 py-2 text-sm',
    md: 'px-7 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
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
