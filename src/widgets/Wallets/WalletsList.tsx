import React from 'react';
import { useWallets, useSetDefaultWallet, type Wallet } from '@entities/wallet';
import { useToast } from '@shared/ui';

export const WalletsList: React.FC = () => {
  const { data: wallets, isLoading, error } = useWallets();
  const setDefaultWallet = useSetDefaultWallet();
  const { showSuccess, showError, showInfo } = useToast();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleSetDefault = async (publicKey: string) => {
    try {
      await setDefaultWallet.mutateAsync({ publicKey });
      showSuccess('Default wallet updated successfully');
    } catch (error: any) {
      console.error('Failed to set default wallet:', error);
      const errorMessage = error?.message || 'Failed to set default wallet';
      showError(errorMessage);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showInfo('Address copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className='wallets-list'>
        <div className='loading'>Loading wallets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='wallets-list'>
        <div className='error'>Error loading wallets: {error.message}</div>
      </div>
    );
  }

  const defaultWallet = wallets?.find((w) => w.isDefault);
  const otherWallets = wallets?.filter((w) => !w.isDefault) || [];

  return (
    <div className='wallets-list'>
      <div className='wallets-header'>
        <h2>My Wallets</h2>
        <div className='wallets-count'>
          {wallets?.length || 0} wallet{wallets?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!wallets || wallets.length === 0 ? (
        <div className='empty-state'>
          <p>No wallets found</p>
          <p className='hint'>Create your first custodial wallet to get started</p>
        </div>
      ) : (
        <>
          {/* Default Wallet Section */}
          {defaultWallet && (
            <div className='wallet-section'>
              <h3>Default Wallet</h3>
              <div className='wallet-card default'>
                <div className='wallet-badge'>
                  <span className='badge-default'>★ Default</span>
                </div>

                <div className='wallet-info'>
                  <div className='wallet-name'>
                    <label>Name</label>
                    <div className='name-value'>{defaultWallet.name}</div>
                  </div>

                  <div className='wallet-address'>
                    <label>Address</label>
                    <div className='address-container'>
                      <code>{formatAddress(defaultWallet.address)}</code>
                      <button
                        className='btn-copy'
                        onClick={() => copyToClipboard(defaultWallet.address)}
                        title='Copy address'
                      >
                        📋
                      </button>
                      <a
                        href={`https://solscan.io/account/${defaultWallet.address}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn-explorer'
                        title='View on Solscan'
                      >
                        🔍
                      </a>
                    </div>
                  </div>

                  {defaultWallet.balance !== undefined && (
                    <div className='wallet-balance'>
                      <label>Balance</label>
                      <div className='balance-value'>{defaultWallet.balance.toFixed(4)} SOL</div>
                    </div>
                  )}

                  <div className='wallet-dates'>
                    <div className='date-item'>
                      <label>Created</label>
                      <div className='date-value'>{formatDate(defaultWallet.createdAt)}</div>
                    </div>
                    {defaultWallet.updatedAt && (
                      <div className='date-item'>
                        <label>Updated</label>
                        <div className='date-value'>{formatDate(defaultWallet.updatedAt)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Wallets Section */}
          {otherWallets.length > 0 && (
            <div className='wallet-section'>
              <h3>Other Wallets</h3>
              <div className='wallets-grid'>
                {otherWallets.map((wallet: Wallet) => (
                  <div key={wallet.id} className='wallet-card'>
                    <div className='wallet-info'>
                      <div className='wallet-name'>
                        <label>Name</label>
                        <div className='name-value'>{wallet.name}</div>
                      </div>

                      <div className='wallet-address'>
                        <label>Address</label>
                        <div className='address-container'>
                          <code>{formatAddress(wallet.address)}</code>
                          <button
                            className='btn-copy'
                            onClick={() => copyToClipboard(wallet.address)}
                            title='Copy address'
                          >
                            📋
                          </button>
                          <a
                            href={`https://solscan.io/account/${wallet.address}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='btn-explorer'
                            title='View on Solscan'
                          >
                            🔍
                          </a>
                        </div>
                      </div>

                      {wallet.balance !== undefined && (
                        <div className='wallet-balance'>
                          <label>Balance</label>
                          <div className='balance-value'>{wallet.balance.toFixed(4)} SOL</div>
                        </div>
                      )}

                      <div className='wallet-dates'>
                        <div className='date-item'>
                          <label>Created</label>
                          <div className='date-value'>{formatDate(wallet.createdAt)}</div>
                        </div>
                      </div>

                      <button
                        className='btn-set-default'
                        onClick={() => handleSetDefault(wallet.address)}
                        disabled={setDefaultWallet.isPending}
                      >
                        {setDefaultWallet.isPending ? 'Setting...' : 'Set as Default'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .wallets-list {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .wallets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .wallets-header h2 {
          margin: 0;
          font-size: 28px;
        }

        .wallets-count {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }

        .wallet-section {
          margin-bottom: 32px;
        }

        .wallet-section h3 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #333;
        }

        .wallet-card {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 2px solid #e0e0e0;
        }

        .wallet-card.default {
          border-color: #ffc107;
          box-shadow: 0 4px 8px rgba(255,193,7,0.2);
        }

        .wallet-badge {
          margin-bottom: 16px;
        }

        .badge-default {
          display: inline-block;
          padding: 6px 12px;
          background: #ffc107;
          color: #000;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
        }

        .wallet-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wallet-name label,
        .wallet-address label,
        .wallet-balance label,
        .date-item label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .name-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .address-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .address-container code {
          font-family: monospace;
          background: #f5f5f5;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 14px;
          flex: 1;
        }

        .btn-copy,
        .btn-explorer {
          padding: 6px 10px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-copy:hover,
        .btn-explorer:hover {
          background: #e0e0e0;
        }

        .balance-value {
          font-size: 20px;
          font-weight: 700;
          color: #28a745;
        }

        .wallet-dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .date-value {
          font-size: 13px;
          color: #666;
        }

        .btn-set-default {
          width: 100%;
          padding: 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
        }

        .btn-set-default:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-set-default:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .wallets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .empty-state {
          padding: 48px;
          text-align: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .empty-state p {
          margin: 8px 0;
          color: #666;
        }

        .empty-state .hint {
          font-size: 14px;
          color: #999;
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
          .wallets-grid {
            grid-template-columns: 1fr;
          }

          .wallet-dates {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
