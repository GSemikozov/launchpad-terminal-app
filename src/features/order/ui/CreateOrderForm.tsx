import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCreateOrder, type OrderSide, type OrderType } from '@entities/order';
import { useToast } from '@shared/ui';

interface OrderFormData {
  token: string;
  side: OrderSide;
  orderType: OrderType;
  triggerPriceSol: number;
  triggerPriceUsd: number;
  amountSol: number;
  amountTokens: number;
  slippagePercent: number;
  expiresInHours: number;
  notes: string;
  enableStopLoss: boolean;
  enableTakeProfit: boolean;
}

export const CreateOrderForm: React.FC = () => {
  const { publicKey } = useWallet();
  const createOrder = useCreateOrder();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<OrderFormData>({
    token: '',
    side: 'buy',
    orderType: 'limit',
    triggerPriceSol: 0,
    triggerPriceUsd: 0,
    amountSol: 1,
    amountTokens: 1000,
    slippagePercent: 1,
    expiresInHours: 24,
    notes: '',
    enableStopLoss: false,
    enableTakeProfit: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      const numericFields = [
        'triggerPriceSol',
        'triggerPriceUsd',
        'amountSol',
        'amountTokens',
        'slippagePercent',
        'expiresInHours',
      ];

      setFormData((prev) => ({
        ...prev,
        [name]: numericFields.includes(name) ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      showError('Please connect your wallet');
      return;
    }

    try {
      const expiresAt = Date.now() + formData.expiresInHours * 60 * 60 * 1000;

      const result = await createOrder.mutateAsync({
        wallet: publicKey.toBase58(),
        token: formData.token,
        side: formData.side,
        orderType: formData.orderType,
        triggerPriceSol: formData.triggerPriceSol,
        triggerPriceUsd: formData.triggerPriceUsd,
        amountSol: formData.amountSol,
        amountTokens: formData.amountTokens,
        slippagePercent: formData.slippagePercent,
        expiresAt,
        notes: formData.notes || undefined,
        enableStopLoss: formData.enableStopLoss,
        enableTakeProfit: formData.enableTakeProfit,
      });

      showSuccess(`Order created successfully! Order ID: ${result.orderId}`);

      setFormData({
        token: '',
        side: 'buy',
        orderType: 'limit',
        triggerPriceSol: 0,
        triggerPriceUsd: 0,
        amountSol: 1,
        amountTokens: 1000,
        slippagePercent: 1,
        expiresInHours: 24,
        notes: '',
        enableStopLoss: false,
        enableTakeProfit: false,
      });
    } catch (error: any) {
      console.error('Order creation failed:', error);
      const errorMessage = error?.message || 'Failed to create order';
      showError(errorMessage);
    }
  };

  return (
    <div className='create-order-form'>
      <h2>Create Limit Order</h2>


      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className='form-section'>
          <h3>Order Details</h3>

          <div className='form-group'>
            <label htmlFor='token'>Token Address *</label>
            <input
              type='text'
              id='token'
              name='token'
              value={formData.token}
              onChange={handleInputChange}
              placeholder='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
              required
            />
            <small>Enter the Solana token mint address</small>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='side'>Side *</label>
              <select
                id='side'
                name='side'
                value={formData.side}
                onChange={handleInputChange}
                required
              >
                <option value='buy'>Buy</option>
                <option value='sell'>Sell</option>
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor='orderType'>Order Type *</label>
              <select
                id='orderType'
                name='orderType'
                value={formData.orderType}
                onChange={handleInputChange}
                required
              >
                <option value='limit'>Limit</option>
                <option value='market'>Market</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className='form-section'>
          <h3>Price</h3>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='triggerPriceSol'>Trigger Price (SOL) *</label>
              <input
                type='number'
                id='triggerPriceSol'
                name='triggerPriceSol'
                value={formData.triggerPriceSol}
                onChange={handleInputChange}
                step='0.000001'
                min='0'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='triggerPriceUsd'>Trigger Price (USD) *</label>
              <input
                type='number'
                id='triggerPriceUsd'
                name='triggerPriceUsd'
                value={formData.triggerPriceUsd}
                onChange={handleInputChange}
                step='0.000001'
                min='0'
                required
              />
            </div>
          </div>
        </div>

        {/* Amount Information */}
        <div className='form-section'>
          <h3>Amount</h3>

          <div className='form-row'>
            <div className='form-group'>
              <label htmlFor='amountSol'>Amount (SOL) *</label>
              <input
                type='number'
                id='amountSol'
                name='amountSol'
                value={formData.amountSol}
                onChange={handleInputChange}
                step='0.01'
                min='0'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='amountTokens'>Amount (Tokens) *</label>
              <input
                type='number'
                id='amountTokens'
                name='amountTokens'
                value={formData.amountTokens}
                onChange={handleInputChange}
                step='1'
                min='0'
                required
              />
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor='slippagePercent'>Slippage (%) *</label>
            <input
              type='number'
              id='slippagePercent'
              name='slippagePercent'
              value={formData.slippagePercent}
              onChange={handleInputChange}
              step='0.1'
              min='0'
              max='100'
              required
            />
            <small>Maximum slippage tolerance (typically 1-5%)</small>
          </div>
        </div>

        {/* Expiration & Options */}
        <div className='form-section'>
          <h3>Options</h3>

          <div className='form-group'>
            <label htmlFor='expiresInHours'>Expires In (Hours) *</label>
            <input
              type='number'
              id='expiresInHours'
              name='expiresInHours'
              value={formData.expiresInHours}
              onChange={handleInputChange}
              step='1'
              min='1'
              max='720'
              required
            />
            <small>Order will expire in {formData.expiresInHours} hours</small>
          </div>

          <div className='form-group'>
            <label htmlFor='notes'>Notes (Optional)</label>
            <textarea
              id='notes'
              name='notes'
              value={formData.notes}
              onChange={handleInputChange}
              placeholder='Buy the dip'
              rows={3}
            />
          </div>

          <div className='checkbox-group'>
            <label className='checkbox-label'>
              <input
                type='checkbox'
                name='enableStopLoss'
                checked={formData.enableStopLoss}
                onChange={handleInputChange}
              />
              <span>Enable Stop Loss</span>
            </label>

            <label className='checkbox-label'>
              <input
                type='checkbox'
                name='enableTakeProfit'
                checked={formData.enableTakeProfit}
                onChange={handleInputChange}
              />
              <span>Enable Take Profit</span>
            </label>
          </div>
        </div>

        <button type='submit' className='btn-primary' disabled={!publicKey || createOrder.isPending}>
          {!publicKey
            ? 'Connect Wallet First'
            : createOrder.isPending
            ? 'Creating Order...'
            : 'Create Order'}
        </button>
      </form>

      <style>{`
        .create-order-form {
          max-width: 700px;
          margin: 0 auto;
          padding: 24px;
        }

        .create-order-form h2 {
          margin: 0 0 24px 0;
          font-size: 28px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .form-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .form-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: #333;
          border-bottom: 2px solid #f5f5f5;
          padding-bottom: 8px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          color: #666;
          font-size: 12px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
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
          margin-top: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
