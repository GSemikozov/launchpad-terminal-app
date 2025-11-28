import React from 'react';
import { useExpiredOrders, type Order } from '@entities/order';
import { Card, Skeleton } from '@shared/ui';

export const ExpiredOrders: React.FC = () => {
  const { data: expiredOrders, isLoading, error } = useExpiredOrders();

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

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
          <p className='text-error font-semibold'>Error loading expired orders</p>
          <p className='text-error/80 text-sm mt-1'>{error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className='expired-orders'>
      <div className='header'>
        <h2>Expired Orders</h2>
        <div className='count-badge'>{expiredOrders?.length || 0} expired</div>
      </div>

      {!expiredOrders || expiredOrders.length === 0 ? (
        <div className='empty-state'>
          <p>No expired orders found</p>
        </div>
      ) : (
        <div className='orders-grid'>
          {expiredOrders.map((order: Order) => (
            <div key={order.orderId} className='order-card'>
              <div className='card-header'>
                <div className='order-id'>
                  <label>Order ID</label>
                  <code>{formatAddress(order.orderId)}</code>
                </div>
                <span className='expired-badge'>Expired</span>
              </div>

              <div className='card-body'>
                <div className='order-info'>
                  <div className='info-item'>
                    <label>Token</label>
                    <a
                      href={`https://solscan.io/token/${order.token}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {formatAddress(order.token)}
                    </a>
                  </div>

                  <div className='info-item'>
                    <label>Side</label>
                    <span className={`badge side-${order.side}`}>{order.side.toUpperCase()}</span>
                  </div>
                </div>

                <div className='order-prices'>
                  <div className='price-item'>
                    <label>Trigger Price</label>
                    <div className='price-value'>{order.triggerPriceSol.toFixed(6)} SOL</div>
                    <div className='price-usd'>${order.triggerPriceUsd.toFixed(6)}</div>
                  </div>

                  <div className='price-item'>
                    <label>Amount</label>
                    <div className='price-value'>{order.amountSol.toFixed(2)} SOL</div>
                    <div className='price-tokens'>{order.amountTokens.toLocaleString()} tokens</div>
                  </div>
                </div>

                <div className='order-dates'>
                  <div className='date-item'>
                    <label>Created</label>
                    <div className='date-value'>{formatDate(order.createdAt)}</div>
                  </div>

                  <div className='date-item'>
                    <label>Expired</label>
                    <div className='date-value'>{formatDate(order.expiresAt)}</div>
                  </div>
                </div>

                {order.notes && (
                  <div className='order-notes'>
                    <label>Notes</label>
                    <p>{order.notes}</p>
                  </div>
                )}

                {order.errorMessage && (
                  <div className='order-error'>
                    <label>Error</label>
                    <p>{order.errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .expired-orders {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header h2 {
          margin: 0;
          font-size: 28px;
        }

        .count-badge {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border-radius: 20px;
          font-weight: 600;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .order-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
          border: 2px solid #6c757d;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }

        .order-id label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .order-id code {
          font-family: monospace;
          font-size: 14px;
          color: #333;
        }

        .expired-badge {
          padding: 4px 12px;
          background: #6c757d;
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-item label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .order-prices {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .price-item label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .price-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .price-usd,
        .price-tokens {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .order-dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .date-item label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .date-value {
          font-size: 13px;
          color: #333;
        }

        .order-notes,
        .order-error {
          padding: 12px;
          border-radius: 4px;
        }

        .order-notes {
          background: #e7f3ff;
          border-left: 3px solid #007bff;
        }

        .order-error {
          background: #f8d7da;
          border-left: 3px solid #dc3545;
        }

        .order-notes label,
        .order-error label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .order-notes label {
          color: #004085;
        }

        .order-error label {
          color: #721c24;
        }

        .order-notes p,
        .order-error p {
          margin: 0;
          font-size: 13px;
        }

        .order-notes p {
          color: #004085;
        }

        .order-error p {
          color: #721c24;
          font-style: italic;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          display: inline-block;
        }

        .badge.side-buy {
          background: #d4edda;
          color: #155724;
        }

        .badge.side-sell {
          background: #f8d7da;
          color: #721c24;
        }

        a {
          color: #007bff;
          text-decoration: none;
          font-size: 13px;
        }

        a:hover {
          text-decoration: underline;
        }

        .empty-state {
          padding: 48px;
          text-align: center;
          background: white;
          border-radius: 8px;
          color: #666;
        }

        .loading,
        .error {
          padding: 48px;
          text-align: center;
          font-size: 18px;
        }

        .loading {
          color: #666;
        }

        .error {
          color: #dc3545;
        }

        @media (max-width: 768px) {
          .orders-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
