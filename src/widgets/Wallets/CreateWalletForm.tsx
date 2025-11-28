import React, { useState } from 'react';
import { useCreateWallet } from '@entities/wallet';
import { useToast } from '@shared/ui';

export const CreateWalletForm: React.FC = () => {
  const createWallet = useCreateWallet();
  const { showSuccess, showError, showInfo } = useToast();
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [createdWallet, setCreatedWallet] = useState<{
    address: string;
    privateKey?: string;
    mnemonic?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please enter a wallet name');
      return;
    }

    try {
      const result = await createWallet.mutateAsync({
        name: name.trim(),
        isDefault,
      });

      setCreatedWallet({
        address: result.address,
        privateKey: result.privateKey,
        mnemonic: result.mnemonic,
      });

      showSuccess('Wallet created successfully! Please save your credentials.');
      setName('');
      setIsDefault(false);
    } catch (error: any) {
      console.error('Wallet creation failed:', error);
      const errorMessage = error?.message || 'Failed to create wallet';
      showError(errorMessage);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showInfo('Copied to clipboard!');
  };

  const handleClose = () => {
    setCreatedWallet(null);
  };

  return (
    <div className='create-wallet-form'>
      <h2>Create New Wallet</h2>

      {createdWallet ? (
        <div className='wallet-created'>
          <div className='success-header'>
            <h3>✅ Wallet Created Successfully!</h3>
            <p>
              Save your private key and mnemonic phrase securely. You won't be able to see them
              again!
            </p>
          </div>

          <div className='credentials-section'>
            <div className='credential-item'>
              <label>Wallet Address</label>
              <div className='credential-value'>
                <code>{createdWallet.address}</code>
                <button className='btn-copy' onClick={() => copyToClipboard(createdWallet.address)}>
                  Copy
                </button>
              </div>
            </div>

            {createdWallet.privateKey && (
              <div className='credential-item danger'>
                <label>⚠️ Private Key (Keep this secret!)</label>
                <div className='credential-value'>
                  <code className='private-key'>{createdWallet.privateKey}</code>
                  <button
                    className='btn-copy'
                    onClick={() => copyToClipboard(createdWallet.privateKey!)}
                  >
                    Copy
                  </button>
                </div>
                <small className='warning'>Never share your private key with anyone!</small>
              </div>
            )}

            {createdWallet.mnemonic && (
              <div className='credential-item danger'>
                <label>⚠️ Mnemonic Phrase (Keep this secret!)</label>
                <div className='credential-value'>
                  <code className='mnemonic'>{createdWallet.mnemonic}</code>
                  <button
                    className='btn-copy'
                    onClick={() => copyToClipboard(createdWallet.mnemonic!)}
                  >
                    Copy
                  </button>
                </div>
                <small className='warning'>
                  Store this mnemonic phrase in a safe place. It's the only way to recover your
                  wallet!
                </small>
              </div>
            )}
          </div>

          <div className='actions'>
            <button className='btn-primary' onClick={handleClose}>
              I've Saved My Credentials
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='name'>Wallet Name *</label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='My Trading Wallet'
              required
              maxLength={50}
            />
            <small>Choose a memorable name for your wallet</small>
          </div>

          <div className='form-group checkbox-group'>
            <label className='checkbox-label'>
              <input
                type='checkbox'
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <span>Set as default wallet</span>
            </label>
            <small>Default wallet will be used for all transactions</small>
          </div>

          <button type='submit' className='btn-primary' disabled={createWallet.isPending}>
            {createWallet.isPending ? 'Creating Wallet...' : 'Create Wallet'}
          </button>

          <div className='info-box'>
            <h4>ℹ️ About Custodial Wallets</h4>
            <p>This will create a new Solana wallet managed by the platform. You'll receive:</p>
            <ul>
              <li>A unique wallet address</li>
              <li>A private key for backup</li>
              <li>A 12-word mnemonic phrase for recovery</li>
            </ul>
            <p className='warning-text'>
              ⚠️ Make sure to save your private key and mnemonic phrase securely!
            </p>
          </div>
        </form>
      )}

      <style>{`
        .create-wallet-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
        }

        .create-wallet-form h2 {
          margin: 0 0 24px 0;
          font-size: 28px;
        }

        .wallet-created {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .success-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #28a745;
        }

        .success-header h3 {
          margin: 0 0 8px 0;
          color: #28a745;
          font-size: 24px;
        }

        .success-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .credentials-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .credential-item {
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
        }

        .credential-item.danger {
          background: #fff3cd;
          border-color: #ffc107;
        }

        .credential-item label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .credential-value {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .credential-value code {
          flex: 1;
          font-family: monospace;
          background: white;
          padding: 10px;
          border-radius: 4px;
          font-size: 13px;
          word-break: break-all;
          border: 1px solid #ddd;
        }

        .credential-value code.private-key,
        .credential-value code.mnemonic {
          color: #dc3545;
          font-weight: 600;
        }

        .btn-copy {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-copy:hover {
          background: #0056b3;
        }

        .warning {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          color: #856404;
          font-weight: 600;
        }

        .actions {
          display: flex;
          justify-content: center;
        }

        form {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input[type="text"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          color: #666;
          font-size: 12px;
        }

        .checkbox-group {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .info-box {
          margin-top: 24px;
          padding: 16px;
          background: #e7f3ff;
          border-left: 4px solid #007bff;
          border-radius: 4px;
        }

        .info-box h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #004085;
        }

        .info-box p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #004085;
        }

        .info-box ul {
          margin: 8px 0;
          padding-left: 24px;
          color: #004085;
        }

        .info-box li {
          margin: 4px 0;
          font-size: 13px;
        }

        .warning-text {
          color: #856404 !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
