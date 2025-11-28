import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTokenTrades as useTokenTradesAPI } from '@entities/token';
import { useTokenTrades as useTokenTradesWS } from '@shared/lib/centrifugo';
import { Card, Skeleton } from '@shared/ui';
import type { TokenTrade } from '@entities/token';

export const TokenDetail: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  
  const { data: apiTrades, isLoading: apiLoading, error: apiError } = useTokenTradesAPI(tokenAddress);
  const { trades: wsTrades, isConnected: wsConnected, error: wsError } = useTokenTradesWS(tokenAddress);

  const trades = useMemo(() => {
    if (wsTrades.length > 0 && wsConnected) {
      return wsTrades.map((trade) => {
        const timestamp = trade.timestamp ? new Date(trade.timestamp).getTime() / 1000 : Date.now() / 1000;
        return {
          time: Math.floor(timestamp),
          token: trade.token_id,
          maker: trade.wallet_address,
          side: trade.type === 'buy' ? 0 : 1,
          sol: trade.amount || 0,
          tokens: trade.price > 0 ? (trade.total || 0) / trade.price : 0,
          price: trade.price || 0,
          tx: trade.id,
          block: 0,
        } as TokenTrade;
      });
    }
    return apiTrades || [];
  }, [wsTrades, wsConnected, apiTrades]);

  const isLoading = apiLoading && wsTrades.length === 0;
  const error = (!wsConnected && wsError) ? null : (wsError || apiError);

  if (isLoading) {
    return (
      <Card padding='lg'>
        <Skeleton height={200} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding='lg'>
        <div className='rounded-xl border border-error/30 bg-error/10 p-4 text-center'>
          <p className='text-error font-semibold'>Error loading token trades</p>
          <p className='text-error/80 text-sm mt-1'>{error.message}</p>
        </div>
      </Card>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <Card padding='lg'>
        <div className='rounded-xl border border-dark-border bg-dark-card p-12 text-center'>
          <p className='text-xl text-gray-400'>No trades found for this token</p>
        </div>
      </Card>
    );
  }

  const formatSide = (side: number) => (side === 0 ? 'Buy' : 'Sell');
  const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleString();
  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div className='token-detail'>
      <div className='token-header'>
        <div className='flex items-center justify-between'>
          <div>
            <h1>Token Trades</h1>
            <p className='token-address'>{tokenAddress}</p>
          </div>
          {wsConnected && !wsError && (
            <span className='px-3 py-1 bg-success/20 border border-success/50 text-success rounded-lg text-sm font-semibold'>
              Live
            </span>
          )}
          {wsError && (
            <span className='px-3 py-1 bg-warning/20 border border-warning/50 text-warning rounded-lg text-sm font-semibold' title={wsError.message}>
              Offline
            </span>
          )}
        </div>
      </div>

      <div className='trades-section'>
        <h2>Recent Trades</h2>
        {trades.length === 0 ? (
          <p>No trades yet</p>
        ) : (
          <div className='trades-table'>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Maker</th>
                  <th>SOL</th>
                  <th>Tokens</th>
                  <th>Price</th>
                  <th>Tx</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: TokenTrade, index: number) => (
                  <tr
                    key={`${trade.tx}-${index}`}
                    className={`trade-${formatSide(trade.side).toLowerCase()}`}
                  >
                    <td>{formatTime(trade.time)}</td>
                    <td>
                      <span className={`badge ${trade.side === 0 ? 'buy' : 'sell'}`}>
                        {formatSide(trade.side)}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://solscan.io/account/${trade.maker}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {formatAddress(trade.maker)}
                      </a>
                    </td>
                    <td>{trade.sol.toFixed(4)} SOL</td>
                    <td>{trade.tokens.toLocaleString()}</td>
                    <td>{trade.price.toFixed(8)}</td>
                    <td>
                      <a
                        href={`https://solscan.io/tx/${trade.tx}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {formatAddress(trade.tx)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .token-detail {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .token-header {
          margin-bottom: 32px;
        }

        .token-header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
        }

        .token-address {
          color: #666;
          font-family: monospace;
          font-size: 14px;
        }

        .trades-section h2 {
          margin-bottom: 16px;
        }

        .trades-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        th {
          background: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #333;
        }

        td {
          padding: 12px;
          border-top: 1px solid #eee;
        }

        tbody tr:hover {
          background: #fafafa;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.buy {
          background: #d4edda;
          color: #155724;
        }

        .badge.sell {
          background: #f8d7da;
          color: #721c24;
        }

        a {
          color: #007bff;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        .loading, .error {
          padding: 48px;
          text-align: center;
          font-size: 18px;
          color: #666;
        }

        .error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
};
