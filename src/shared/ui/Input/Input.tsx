import classNames from 'classnames';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, fullWidth = false, className, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={classNames('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className='text-sm font-medium text-gray-300'>
            {label}
            {props.required && <span className='ml-1 text-error'>*</span>}
          </label>
        )}

        <div className='relative'>
          {leftIcon && (
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400'>
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={classNames(
              'block w-full rounded-xl border bg-dark-card px-4 py-2.5 text-white placeholder-gray-500 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark',
              error
                ? 'border-error focus:border-error focus:ring-error'
                : 'border-dark-border focus:border-primary focus:ring-primary hover:border-primary/50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              props.disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400'>
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p className={classNames('text-sm', error ? 'text-error' : 'text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
