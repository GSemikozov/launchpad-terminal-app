import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = 'bg-dark-border';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse-slow',
    none: '',
  };

  return (
    <div
      className={classNames(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined),
        ...style,
      }}
      {...props}
    />
  );
}

export function TokenCardSkeleton() {
  return (
    <div className='rounded-2xl border border-dark-border bg-dark-card p-4'>
      <div className='flex items-start gap-4'>
        <Skeleton variant='circular' width={48} height={48} />
        <div className='flex-1 space-y-3'>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <Skeleton width={120} height={20} />
              <Skeleton width={60} height={16} />
            </div>
            <div className='space-y-2 text-right'>
              <Skeleton width={80} height={20} />
              <Skeleton width={60} height={16} />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        </div>
      </div>
    </div>
  );
}
