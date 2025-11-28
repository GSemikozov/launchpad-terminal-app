import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full';

  const variantStyles = {
    success: 'bg-success/20 text-success border border-success/30',
    error: 'bg-error/20 text-error border border-error/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    info: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
    primary: 'bg-primary/20 text-primary border border-primary/30',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={classNames(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
