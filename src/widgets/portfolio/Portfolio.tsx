import { useWallet } from '@solana/wallet-adapter-react';
import { usePortfolio } from '@entities/profile';
import { Card, Skeleton } from '@shared/ui';

export function Portfolio() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const { data: portfolio, isLoading } = usePortfolio(walletAddress);

  if (!walletAddress) {
    return (
      <Card padding='lg'>
        <p className='text-gray-400'>Please connect your wallet</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card padding='lg'>
        <Skeleton height={200} />
      </Card>
    );
  }

  return (
    <Card padding='lg'>
      <h3 className='text-xl font-bold text-white mb-4'>Portfolio</h3>

      {portfolio && portfolio.length > 0 ? (
        <div className='space-y-3'>
          {portfolio.map((token) => (
            <div
              key={token.token_id}
              className='border border-dark-border rounded-xl p-4 hover:border-primary transition-colors'
            >
              <div className='flex items-start justify-between'>
                <div>
                  <h4 className='font-semibold text-white'>{token.token_name}</h4>
                  <p className='text-sm text-gray-400'>{token.token_symbol}</p>
                </div>
                <div className='text-right'>
                  <p className='font-semibold text-white'>{token.amount}</p>
                  {token.current_price && (
                    <p className='text-sm text-gray-400'>${token.current_price.toFixed(6)}</p>
                  )}
                </div>
              </div>
              {token.pnl !== undefined && (
                <div className='mt-2 pt-2 border-t border-dark-border'>
                  <p
                    className={`text-sm font-medium ${
                      token.pnl >= 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    P&L: {token.pnl >= 0 ? '+' : ''}${token.pnl.toFixed(2)}{' '}
                    {token.pnl_percentage !== undefined &&
                      `(${token.pnl_percentage >= 0 ? '+' : ''}${token.pnl_percentage.toFixed(
                        2
                      )}%)`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className='text-gray-400 text-center py-8'>No tokens in portfolio</p>
      )}
    </Card>
  );
}

