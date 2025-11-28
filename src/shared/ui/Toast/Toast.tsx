import { useEffect, useState } from 'react';
import classNames from 'classnames';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const typeStyles = {
    success: 'bg-success/90 backdrop-blur-md border-success text-white shadow-success/50',
    error: 'bg-error/90 backdrop-blur-md border-error text-white shadow-error/50',
    info: 'bg-primary/90 backdrop-blur-md border-primary text-white shadow-primary/50',
    warning: 'bg-warning/90 backdrop-blur-md border-warning text-white shadow-warning/50',
  };

  return (
    <div
      className={classNames(
        'rounded-xl border-2 px-4 py-3 shadow-2xl transition-all duration-300 flex items-center justify-between gap-4 min-w-[300px] max-w-md',
        typeStyles[type],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <p className='text-sm font-semibold flex-1'>{message}</p>
      <button
        onClick={handleClose}
        className='text-white/80 hover:text-white transition-colors flex-shrink-0'
        aria-label='Close'
      >
        <svg
          className='w-5 h-5'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
    </div>
  );
}

