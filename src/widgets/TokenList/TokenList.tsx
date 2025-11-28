import { useState, useMemo, useEffect, useRef } from 'react';
import { useTokensLive, useInfiniteTokens, type Token } from '@entities/token';
import { useTokenPrices } from '@shared/lib/centrifugo';
import { Input, TokenCard, TokenCardSkeleton, useToast } from '@shared/ui';
import { SearchIcon, FireIcon } from '@shared/ui/icons';

export function TokenList() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'market_cap' | 'created_at'>('volume');
  const { showInfo, showSuccess } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  const params: Parameters<typeof useInfiniteTokens>[0] = {
    search,
    sort: sortBy,
    order: 'desc',
    limit: 20,
  };

  const {
    data: liveTokens,
    isLoading: liveLoading,
    error: liveError,
  } = useTokensLive(params);

  const {
    data: infiniteData,
    isLoading: infiniteLoading,
    isFetchingNextPage,
    hasNextPage,
    error: infiniteError,
    fetchNextPage,
  } = useInfiniteTokens(params);

  const { prices: livePrices } = useTokenPrices();

  const baseTokens =
    liveTokens && liveTokens.length > 0
      ? liveTokens
      : infiniteData?.pages.flatMap((page) => page.items) || [];

  const isLoading = (liveLoading && !infiniteData && !infiniteError) || infiniteLoading;
  const error = liveError && !liveTokens?.length ? liveError : infiniteError;

  const isLiveBadGateway = liveError && (liveError as any).code === 'BAD_GATEWAY';

  const [hasShownLiveError, setHasShownLiveError] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLiveBadGateway && !hasShownLiveError) {
      showInfo("Can't load latest tokens. Showing cached data.");
      setHasShownLiveError(true);
    }
  }, [isLiveBadGateway, hasShownLiveError, showInfo]);

  useEffect(() => {
    if (!filtersRef.current) return;

    const handleScroll = () => {
      if (!filtersRef.current) return;
      const rect = filtersRef.current.getBoundingClientRect();
      const headerHeight = 64;
      setIsSticky(rect.top <= headerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tokens = useMemo(() => {
    if (!baseTokens) return [];
    
    return baseTokens.map((token: Token) => {
      const tokenId = token.token;
      const livePrice = livePrices.get(tokenId);
      
      const normalizedToken: Token = {
        ...token,
        id: tokenId,
        mint_address: token.token,
        image_url: token.photo,
        market_cap: token.marketCapUsd,
        volume_24h: token.volumeUsd,
        creator_address: token.creator,
      };
      
      if (livePrice) {
        normalizedToken.price = livePrice.price;
        normalizedToken.change_24h = livePrice.change_24h;
        normalizedToken.volume_24h = livePrice.volume_24h;
      }
      
      return normalizedToken;
    });
  }, [baseTokens, livePrices]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h2 className='text-3xl font-bold text-white flex items-center gap-2'>
            <FireIcon className='h-8 w-8 text-primary' />
            Hot Tokens
          </h2>
          <p className='text-gray-400 mt-1'>Discover the hottest tokens on Solana</p>
        </div>
      </div>

      {/* Filters */}
      <div
        ref={filtersRef}
        className={`sticky top-16 z-30 py-4 -mx-4 px-4 lg:left-0 lg:right-0 lg:mx-0 lg:pl-4 lg:pr-0 border-b border-dark-border transition-all duration-200 ${
          isSticky ? 'bg-dark backdrop-blur-lg' : ''
        }`}
      >
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-end'>
          <Input
            placeholder='Search tokens...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<SearchIcon className='h-5 w-5' />}
            className='flex-1'
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className='rounded-xl border border-dark-border bg-dark-card px-4 py-2.5 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark'
          >
            <option value='volume'>Volume 24h</option>
            <option value='market_cap'>Market Cap</option>
            <option value='price'>Price</option>
            <option value='created_at'>Recently Created</option>
          </select>
        </div>
      </div>

      {/* Token Grid */}
      {error && !isLiveBadGateway && (
        <div className='rounded-xl border border-error/30 bg-error/10 p-4 text-center'>
          <p className='text-error'>Failed to load tokens. Please try again.</p>
        </div>
      )}

      {isLoading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <TokenCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {tokens.map((token) => (
            <TokenCard
              key={token.id}
              name={token.name}
              symbol={token.symbol}
              price={token.price ?? 0}
              change24h={token.change_24h ?? 0}
              volume={token.volume_24h ?? 0}
              marketCap={token.market_cap ?? 0}
              imageUrl={token.image_url}
              createdAt={token.createdAt}
              updatedAt={token.updatedAt}
              ca={token.mint_address}
              isCurrentlyLive={token.isCurrentlyLive}
              tokenType={token.tokenType}
              progress={token.progress}
              holders={token.holders}
              buys={token.buys}
              sells={token.sells}
              txCount={token.txCount}
              creatorSharePercentage={token.creatorSharePercentage}
              onCopyCa={() => {
                if (!token.mint_address || typeof navigator === 'undefined') return;
                navigator.clipboard.writeText(token.mint_address).then(
                  () => showSuccess('Token address copied'),
                  () => showInfo('Failed to copy address')
                );
              }}
              onClick={() => {
                // TODO: Navigate to token detail page
              }}
            />
          ))}
          {hasNextPage && (
            <div ref={loadMoreRef} className='h-10 w-full flex items-center justify-center'>
              {isFetchingNextPage && (
                <span className='text-xs text-gray-500'>Loading more tokens...</span>
              )}
            </div>
          )}
        </div>
      )}

      {!isLoading && tokens.length === 0 && !error && (
        <div className='rounded-xl border border-dark-border bg-dark-card p-12 text-center'>
          <p className='text-xl text-gray-400'>No tokens found</p>
          <p className='text-sm text-gray-500 mt-2'>Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}
