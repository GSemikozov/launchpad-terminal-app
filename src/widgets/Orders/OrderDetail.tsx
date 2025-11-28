import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrderById } from '@entities/order';
import { Card, Skeleton } from '@shared/ui';
import type { OrderStatus } from '@entities/order';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#ffc107',
  triggered: '#17a2b8',
  executing: '#007bff',
  completed: '#28a745',
  failed: '#dc3545',
  cancelled: '#6c757d',
  expired: '#6c757d',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  triggered: 'Triggered',
  executing: 'Executing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useOrderById(orderId);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (isLoading) {
    return (
      <Card padding='lg'>
        <Skeleton height={300} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding='lg'>
        <div className='rounded-xl border border-error/30 bg-error/10 p-4 text-center'>
          <p className='text-error font-semibold'>Error loading order</p>
          <p className='text-error/80 text-sm mt-1'>{error.message}</p>
        </div>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card padding='lg'>
        <div className='rounded-xl border border-dark-border bg-dark-card p-12 text-center'>
          <p className='text-xl text-gray-400'>Order not found</p>
        </div>
      </Card>
    );
  }

  return (
    <div className='order-detail'>
      <div className='order-header'>
        <h1>Order Details</h1>
        <span className='status-badge' style={{ backgroundColor: STATUS_COLORS[order.status] }}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className='detail-sections'>
        {/* Main Information */}
        <section className='detail-section'>
          <h2>Main Information</h2>
          <div className='detail-grid'>
            <div className='detail-item'>
              <label>Order ID</label>
              <div className='value'>
                <code>{order.orderId}</code>
              </div>
            </div>

            <div className='detail-item'>
              <label>Wallet</label>
              <div className='value'>
                <a
                  href={`https://solscan.io/account/${order.wallet}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {formatAddress(order.wallet)}
                </a>
              </div>
            </div>

            <div className='detail-item'>
              <label>Token</label>
              <div className='value'>
                <a
                  href={`https://solscan.io/token/${order.token}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {formatAddress(order.token)}
                </a>
              </div>
            </div>

            <div className='detail-item'>
              <label>Side</label>
              <div className='value'>
                <span className={`badge side-${order.side}`}>{order.side.toUpperCase()}</span>
              </div>
            </div>

            <div className='detail-item'>
              <label>Order Type</label>
              <div className='value'>{order.orderType || '—'}</div>
            </div>
          </div>
        </section>

        {/* Price Information */}
        <section className='detail-section'>
          <h2>Price Information</h2>
          <div className='detail-grid'>
            <div className='detail-item'>
              <label>Trigger Price (SOL)</label>
              <div className='value highlight'>{order.triggerPriceSol.toFixed(6)} SOL</div>
            </div>

            <div className='detail-item'>
              <label>Trigger Price (USD)</label>
              <div className='value'>${order.triggerPriceUsd.toFixed(6)}</div>
            </div>

            {order.executedPriceSol && (
              <>
                <div className='detail-item'>
                  <label>Executed Price (SOL)</label>
                  <div className='value highlight'>{order.executedPriceSol.toFixed(6)} SOL</div>
                </div>

                <div className='detail-item'>
                  <label>Executed Price (USD)</label>
                  <div className='value'>${order.executedPriceUsd?.toFixed(6) || '—'}</div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Amount Information */}
        <section className='detail-section'>
          <h2>Amount Information</h2>
          <div className='detail-grid'>
            <div className='detail-item'>
              <label>Amount (SOL)</label>
              <div className='value highlight'>{order.amountSol.toFixed(4)} SOL</div>
            </div>

            <div className='detail-item'>
              <label>Amount (Tokens)</label>
              <div className='value'>{order.amountTokens.toLocaleString()}</div>
            </div>

            {order.executedAmountSol && (
              <>
                <div className='detail-item'>
                  <label>Executed Amount (SOL)</label>
                  <div className='value'>{order.executedAmountSol.toFixed(4)} SOL</div>
                </div>

                <div className='detail-item'>
                  <label>Executed Amount (Tokens)</label>
                  <div className='value'>{order.executedAmountTokens?.toLocaleString() || '—'}</div>
                </div>
              </>
            )}

            <div className='detail-item'>
              <label>Slippage</label>
              <div className='value'>{order.slippagePercent}%</div>
            </div>

            {order.feeSol && (
              <div className='detail-item'>
                <label>Fee</label>
                <div className='value'>{order.feeSol.toFixed(6)} SOL</div>
              </div>
            )}
          </div>
        </section>

        {/* Timestamps */}
        <section className='detail-section'>
          <h2>Timeline</h2>
          <div className='detail-grid'>
            <div className='detail-item'>
              <label>Created At</label>
              <div className='value'>{formatDate(order.createdAt)}</div>
            </div>

            <div className='detail-item'>
              <label>Updated At</label>
              <div className='value'>{formatDate(order.updatedAt)}</div>
            </div>

            {order.triggeredAt && (
              <div className='detail-item'>
                <label>Triggered At</label>
                <div className='value'>{formatDate(order.triggeredAt)}</div>
              </div>
            )}

            {order.executedAt && (
              <div className='detail-item'>
                <label>Executed At</label>
                <div className='value'>{formatDate(order.executedAt)}</div>
              </div>
            )}

            <div className='detail-item'>
              <label>Expires At</label>
              <div className='value'>{formatDate(order.expiresAt)}</div>
            </div>

            {order.lastAttemptAt && (
              <div className='detail-item'>
                <label>Last Attempt At</label>
                <div className='value'>{formatDate(order.lastAttemptAt)}</div>
              </div>
            )}
          </div>
        </section>

        {/* Transaction Details */}
        {order.txSignature && (
          <section className='detail-section'>
            <h2>Transaction</h2>
            <div className='detail-item'>
              <label>Transaction Signature</label>
              <div className='value'>
                <a
                  href={`https://solscan.io/tx/${order.txSignature}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {formatAddress(order.txSignature)}
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Error & Notes */}
        {(order.errorMessage || order.notes) && (
          <section className='detail-section'>
            <h2>Additional Information</h2>

            {order.errorMessage && (
              <div className='detail-item'>
                <label>Error Message</label>
                <div className='value error-message'>{order.errorMessage}</div>
              </div>
            )}

            {order.notes && (
              <div className='detail-item'>
                <label>Notes</label>
                <div className='value'>{order.notes}</div>
              </div>
            )}

            {order.executionAttempts !== undefined && (
              <div className='detail-item'>
                <label>Execution Attempts</label>
                <div className='value'>{order.executionAttempts}</div>
              </div>
            )}

            {order.enableStopLoss !== undefined && (
              <div className='detail-item'>
                <label>Stop Loss Enabled</label>
                <div className='value'>{order.enableStopLoss ? 'Yes' : 'No'}</div>
              </div>
            )}

            {order.enableTakeProfit !== undefined && (
              <div className='detail-item'>
                <label>Take Profit Enabled</label>
                <div className='value'>{order.enableTakeProfit ? 'Yes' : 'No'}</div>
              </div>
            )}
          </section>
        )}
      </div>

      <style>{`
        .order-detail {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .order-header h1 {
          margin: 0;
          font-size: 32px;
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 14px;
        }

        .detail-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detail-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .detail-section h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #333;
          border-bottom: 2px solid #f5f5f5;
          padding-bottom: 8px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-item .value {
          font-size: 16px;
          color: #333;
        }

        .detail-item .value.highlight {
          font-weight: 600;
          color: #007bff;
        }

        .detail-item .value.error-message {
          color: #dc3545;
          font-style: italic;
        }

        code {
          font-family: monospace;
          background: #f5f5f5;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          word-break: break-all;
        }

        a {
          color: #007bff;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
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

        .loading, .error {
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
      `}</style>
    </div>
  );
};
