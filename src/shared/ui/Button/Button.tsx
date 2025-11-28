import classNames from 'classnames';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark';

  const variantStyles = {
    primary:
      'bg-gradient-primary text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,0,255,0.5)] focus:ring-primary',
    secondary:
      'bg-gradient-secondary text-dark hover:opacity-90 hover:shadow-[0_0_20px_rgba(20,241,149,0.5)] focus:ring-secondary',
    outline:
      'border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] focus:ring-primary',
    ghost: 'text-white hover:bg-white/10 focus:ring-white/50',
    danger:
      'bg-error text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,59,105,0.5)] focus:ring-error',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2 text-base rounded-xl gap-2',
    lg: 'px-6 py-3 text-lg rounded-2xl gap-2.5',
  };

  return (
    <button
      className={classNames(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className='animate-spin h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className='flex-shrink-0'>{leftIcon}</span>}
          {children}
          {rightIcon && <span className='flex-shrink-0'>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
