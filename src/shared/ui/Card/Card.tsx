import classNames from 'classnames';
import { useState } from 'react';
import type { HTMLAttributes } from 'react';
import { CopyIcon } from '../icons';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variantStyles = {
    default: 'bg-dark-card border border-dark-border',
    gradient: 'bg-gradient-card border border-dark-border',
    glow: 'bg-dark-card border border-primary shadow-[0_0_20px_rgba(255,0,255,0.3)]',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverStyles = hover
    ? 'hover:border-primary hover:shadow-[0_0_25px_rgba(255,0,255,0.4)] cursor-pointer'
    : '';

  return (
    <div
      className={classNames(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TokenCardProps {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  imageUrl?: string;
  onClick?: () => void;
  createdAt?: string;
  updatedAt?: string;
  ca?: string;
  onCopyCa?: () => void;
  isCurrentlyLive?: boolean;
  tokenType?: string;
  progress?: number;
  holders?: number;
  buys?: number;
  sells?: number;
  txCount?: number;
  creatorSharePercentage?: number;
}

export function TokenCard({
  name,
  symbol,
  price,
  change24h,
  volume,
  marketCap,
  imageUrl,
  onClick,
  createdAt,
  updatedAt,
  ca,
  onCopyCa,
  isCurrentlyLive,
  tokenType,
  progress,
  holders,
  buys,
  sells,
  txCount,
  creatorSharePercentage,
}: TokenCardProps) {
  const isPositive = change24h >= 0;

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // For longer periods, use weeks or months
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks < 4) return `${diffWeeks}w ago`;
      
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths}mo ago`;
    } catch {
      return '';
    }
  };

  // Prefer updatedAt, fallback to createdAt
  const displayTime = updatedAt || createdAt;
  const hasTime = Boolean(displayTime && displayTime.trim() !== '');

  const shortenAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const [imageError, setImageError] = useState(false);
  const showFallback = !imageUrl || imageError;

  return (
    <Card variant='default' hover onClick={onClick}>
      <div className='flex items-start gap-4'>
        {/* Token Image */}
        <div className='flex flex-col items-center gap-1'>
          <div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-primary relative'>
            {!showFallback ? (
              <img
                src={imageUrl}
                alt={name}
                className='h-full w-full object-cover'
                onError={() => setImageError(true)}
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-xl font-bold text-white'>
                {symbol.charAt(0)}
              </div>
            )}
            <div className='absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 z-10'>
              <span className='relative flex h-3 w-3'>
                {isCurrentlyLive ? (
                  <>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-3 w-3 bg-success border-2 border-dark-card'></span>
                  </>
                ) : (
                  <span className='relative inline-flex rounded-full h-3 w-3 bg-gray-500 border-2 border-dark-card'></span>
                )}
              </span>
            </div>
          </div>
          {hasTime && displayTime && (
            <p
              className='text-[11px] text-gray-500 leading-none mt-0.5 text-center w-12 truncate'
              title={displayTime}
            >
              {formatTime(displayTime)}
            </p>
          )}
        </div>

        {/* Token Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold text-white truncate' title={name}>
                  {name}
                </h3>
                {tokenType && (
                  <span className='px-1.5 py-0.5 text-[10px] font-medium rounded bg-primary/20 text-primary border border-primary/30 flex-shrink-0'>
                    {tokenType}
                  </span>
                )}
              </div>
              <p className='text-sm text-gray-400 truncate' title={symbol}>
                {symbol}
              </p>
            </div>
            <div className='text-right flex-shrink-0'>
              <div>
                <p className='text-[10px] text-gray-400 mb-0.5'>Price</p>
                <p className='font-semibold text-white'>${price.toFixed(6)}</p>
              </div>
              <div className='mt-1'>
                <p className='text-[10px] text-gray-400 mb-0.5'>24h</p>
                <p
                  className={classNames(
                    'text-sm font-medium',
                    isPositive ? 'text-success' : 'text-error'
                  )}
                >
                  {isPositive ? '+' : ''}
                  {change24h.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar if available */}
          {progress !== undefined && progress > 0 && (
            <div className='mt-2'>
              <div className='flex items-center justify-between mb-0.5'>
                <p className='text-[10px] text-gray-400'>Progress</p>
                <p className='text-[10px] text-gray-500'>
                  {Math.round(progress * 100)}%
                </p>
              </div>
              <div className='h-1.5 w-full rounded-full bg-dark-lighter border border-dark-border overflow-hidden'>
                <div
                  className='h-full bg-gradient-primary transition-all duration-300'
                  style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* CA + Stats */}
          <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
            <div className='min-w-0'>
              {ca ? (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyCa?.();
                  }}
                  className='flex items-center gap-2 text-left text-[11px] text-gray-400 hover:text-white transition-colors w-full'
                  title={ca}
                >
                  <span className='font-mono truncate'>{shortenAddress(ca)}</span>
                  <CopyIcon className='h-3 w-3 flex-shrink-0' />
                </button>
              ) : (
                <>
                  <p className='text-gray-400'>Volume</p>
                  <p className='font-medium text-white'>${(volume / 1000).toFixed(1)}K</p>
                </>
              )}
              {holders !== undefined && holders > 0 && (
                <p className='text-[10px] text-gray-500 mt-1'>{holders} holders</p>
              )}
              {buys !== undefined && sells !== undefined && (buys > 0 || sells > 0) && (
                <div className='mt-1.5'>
                  <div className='flex items-center justify-between mb-0.5'>
                    <p className='text-[10px] text-gray-400'>Buys/Sells</p>
                    <span className='text-[10px] text-gray-500'>
                      {buys}/{sells}
                    </span>
                  </div>
                  <div className='flex-1 h-1 rounded-full bg-dark-lighter overflow-hidden'>
                    <div
                      className='h-full bg-success transition-all'
                      style={{
                        width: `${buys + sells > 0 ? (buys / (buys + sells)) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className='text-right'>
              <p className='text-gray-400'>Market Cap</p>
              <p className='font-medium text-white'>${(marketCap / 1000000).toFixed(2)}M</p>
              {txCount !== undefined && txCount > 0 && (
                <p className='text-[10px] text-gray-500 mt-1'>{txCount} txs</p>
              )}
              {creatorSharePercentage !== undefined && creatorSharePercentage > 0 && (
                <p className='text-[10px] text-gray-500 mt-0.5'>
                  Creator: {creatorSharePercentage.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
