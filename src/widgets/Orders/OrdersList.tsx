import React, { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useActiveOrders, useCancelOrder, useMyOrders, type Order, type OrderStatus } from '@entities/order';
import { useToast } from '@shared/ui';

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

export const OrdersList: React.FC = () => {
  const { publicKey } = useWallet();
  const { showSuccess, showError } = useToast();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const cancelOrder = useCancelOrder();

  const walletAddress = publicKey?.toBase58();
  const { data: allOrders, isLoading: allLoading } = useMyOrders(walletAddress);
  const { data: activeOrders, isLoading: activeLoading } = useActiveOrders(walletAddress);

  const isLoading = allLoading || activeLoading;

  const mockOrder: Order = {
    orderId: 'mock-order-1234567890',
    wallet: walletAddress || '5DgV...U2eC',
    token: 'HMa7WuncaNhZjHAKY83uABGvEudC3rK3tbT5wvsqpump',
    side: 'buy',
    status: 'pending',
    orderType: 'limit',
    triggerPriceSol: 0.0001,
    triggerPriceUsd: 0.0002,
    amountSol: 1.5,
    amountTokens: 1000000,
    slippagePercent: 1,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    expiresAt: Date.now() + 86400000,
    notes: 'Test order',
  };

  // Use mock data if no real orders available (for UI testing)
  // Priority: real orders > empty array with mock > mock when data is loading
  const ordersToDisplay = useMemo(() => {
    // If we have real orders (even if empty array), use them
    if (allOrders !== undefined && allOrders !== null) {
      // If real orders exist, use them; otherwise use mock for testing
      return allOrders.length > 0 ? allOrders : [mockOrder];
    }
    // Return mock order for testing when data is not loaded yet or undefined/null
    return [mockOrder];
  }, [allOrders, mockOrder]);
  const filteredOrders = useMemo(
    () =>
      statusFilter === 'all'
        ? ordersToDisplay
        : ordersToDisplay?.filter((order) => order.status === statusFilter),
    [ordersToDisplay, statusFilter]
  );

  const handleCancelOrder = async (orderId: string) => {
    if (!walletAddress) return;

    try {
      await cancelOrder.mutateAsync({ orderId, wallet: walletAddress });
      showSuccess('Order cancelled successfully');
    } catch (error: any) {
      console.error('Cancel order failed:', error);
      const errorMessage = error?.message || 'Failed to cancel order';
      showError(errorMessage);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: number) => {
    return price.toFixed(6);
  };

  if (!walletAddress) {
    return (
      <div className='rounded-xl border border-dark-border bg-dark-card p-8 text-center text-gray-400'>
        Connect your wallet to view orders
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center'>
          <label className='text-sm text-gray-400'>Filter by status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
            className='w-full md:w-64 rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60'
          >
            <option value='all'>All</option>
            <option value='pending'>Pending</option>
            <option value='triggered'>Triggered</option>
            <option value='executing'>Executing</option>
            <option value='completed'>Completed</option>
            <option value='failed'>Failed</option>
            <option value='cancelled'>Cancelled</option>
            <option value='expired'>Expired</option>
          </select>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-300'>
          <span className='px-3 py-1 rounded-full bg-dark-lighter border border-dark-border'>
            Active: {activeOrders?.length || (ordersToDisplay?.length || 0)}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className='rounded-xl border border-dark-border bg-dark-card p-8 text-center text-gray-400'>
          Loading orders...
        </div>
      )}

      {!isLoading && (!filteredOrders || filteredOrders.length === 0) && (
        <div className='rounded-xl border border-dark-border bg-dark-card p-8 text-center text-gray-400'>
          No orders found
        </div>
      )}

      {!isLoading && filteredOrders && filteredOrders.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className='hidden lg:block overflow-x-auto rounded-xl border border-dark-border bg-dark-card' style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className='inline-block min-w-full align-middle'>
              <table className='divide-y divide-dark-border' style={{ minWidth: '1000px', width: '100%' }}>
              <thead className='bg-dark'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Order ID
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Token
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Side
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Trigger
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Amount
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Created
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Expires
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Notes
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-dark-border'>
                {filteredOrders.map((order: Order) => (
                  <tr key={order.orderId} className='hover:bg-dark-lighter'>
                    <td className='px-4 py-3 text-sm text-gray-200 font-mono'>
                      {formatAddress(order.orderId)}
                    </td>
                    <td className='px-4 py-3 text-sm text-primary'>
                      <a
                        href={`https://solscan.io/token/${order.token}`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {formatAddress(order.token)}
                      </a>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.side === 'buy'
                            ? 'bg-success/20 text-success border border-success/40'
                            : 'bg-error/20 text-error border border-error/40'
                        }`}
                      >
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <span
                        className='px-2 py-1 rounded-full text-xs font-semibold text-white'
                        style={{ backgroundColor: STATUS_COLORS[order.status] }}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-200'>
                      <div>{formatPrice(order.triggerPriceSol)} SOL</div>
                      <div className='text-xs text-gray-400'>
                        ${formatPrice(order.triggerPriceUsd)}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-200'>
                      <div>{order.amountSol.toFixed(2)} SOL</div>
                      <div className='text-xs text-gray-400'>
                        {order.amountTokens.toLocaleString()} tokens
                      </div>
                    </td>
                    <td className='px-4 py-3 text-xs text-gray-400'>{formatDate(order.createdAt)}</td>
                    <td className='px-4 py-3 text-xs text-gray-400'>{formatDate(order.expiresAt)}</td>
                    <td className='px-4 py-3 text-sm text-gray-300'>{order.notes || '—'}</td>
                    <td className='px-4 py-3 text-sm text-gray-200'>
                      {order.status === 'pending' && (
                        <button
                          className='rounded-lg border border-error/50 bg-error/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-error/30 disabled:cursor-not-allowed disabled:opacity-60'
                          onClick={() => handleCancelOrder(order.orderId)}
                          disabled={cancelOrder.isPending}
                        >
                          {cancelOrder.isPending ? 'Canceling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className='lg:hidden space-y-4'>
            {filteredOrders.map((order: Order) => (
              <div
                key={order.orderId}
                className='rounded-xl border border-dark-border bg-dark-card p-4 space-y-3'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs text-gray-400 mb-1'>Order ID</p>
                    <p className='text-sm text-gray-200 font-mono truncate' title={order.orderId}>
                      {formatAddress(order.orderId)}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.side === 'buy'
                          ? 'bg-success/20 text-success border border-success/40'
                          : 'bg-error/20 text-error border border-error/40'
                      }`}
                    >
                      {order.side.toUpperCase()}
                    </span>
                    <span
                      className='px-2 py-1 rounded-full text-xs font-semibold text-white'
                      style={{ backgroundColor: STATUS_COLORS[order.status] }}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>

                <div>
                  <p className='text-xs text-gray-400 mb-1'>Token</p>
                  <a
                    href={`https://solscan.io/token/${order.token}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-primary font-mono truncate block'
                    title={order.token}
                  >
                    {formatAddress(order.token)}
                  </a>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Trigger Price</p>
                    <p className='text-sm text-gray-200'>{formatPrice(order.triggerPriceSol)} SOL</p>
                    <p className='text-xs text-gray-400'>${formatPrice(order.triggerPriceUsd)}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Amount</p>
                    <p className='text-sm text-gray-200'>{order.amountSol.toFixed(2)} SOL</p>
                    <p className='text-xs text-gray-400'>{order.amountTokens.toLocaleString()} tokens</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Created</p>
                    <p className='text-xs text-gray-300'>{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Expires</p>
                    <p className='text-xs text-gray-300'>{formatDate(order.expiresAt)}</p>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Notes</p>
                    <p className='text-sm text-gray-300'>{order.notes}</p>
                  </div>
                )}

                {order.status === 'pending' && (
                  <div className='pt-2 border-t border-dark-border'>
                    <button
                      className='w-full rounded-lg border border-error/50 bg-error/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-error/30 disabled:cursor-not-allowed disabled:opacity-60'
                      onClick={() => handleCancelOrder(order.orderId)}
                      disabled={cancelOrder.isPending}
                    >
                      {cancelOrder.isPending ? 'Canceling...' : 'Cancel Order'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {filteredOrders && filteredOrders.length > 0 && (
        <div className='flex flex-wrap gap-4 rounded-xl border border-dark-border bg-dark-card p-4 text-sm text-gray-200'>
          <div>
            <span className='text-gray-400'>Total Orders:</span> {filteredOrders.length}
          </div>
          <div>
            <span className='text-gray-400'>Total SOL:</span>{' '}
            {filteredOrders.reduce((sum, o) => sum + o.amountSol, 0).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};
