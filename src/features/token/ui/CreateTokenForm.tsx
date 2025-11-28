import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import {
  useCreateTokenDraft,
  useGenerateTokenTx,
  useSignTokenTx,
  useGetSignMessage,
  type TokenDraftRequest,
} from '@entities/token';
import { useUploadImage } from '@shared/api/hooks/useUploadImage';
import { useToast } from '@shared/ui';

interface FormData {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  supply: number;
  hardcap: number;
  website: string;
  twitter: string;
  telegram: string;
  image: File | null;
}

export const CreateTokenForm: React.FC = () => {
  const { publicKey, signMessage, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { showError, showSuccess, showInfo } = useToast();
  const [step, setStep] = useState<'form' | 'upload' | 'draft' | 'sign' | 'complete'>('form');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tokenMint, setTokenMint] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    symbol: '',
    description: '',
    decimals: 9,
    supply: 1000000000,
    hardcap: 100,
    website: '',
    twitter: '',
    telegram: '',
    image: null,
  });

  const uploadImage = useUploadImage();
  const createDraft = useCreateTokenDraft();
  const generateTokenTx = useGenerateTokenTx();
  const signTokenTx = useSignTokenTx();
  const getSignMessage = useGetSignMessage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'decimals' || name === 'supply' || name === 'hardcap' ? Number(value) : value,
    }));
  };

  const MAX_IMAGE_SIZE = 1 * 1024 * 1024;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      showError(`Image size exceeds maximum allowed size of 1 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      e.target.value = '';
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      showError('Invalid image format. Please use JPEG, PNG, GIF, or WebP');
      e.target.value = '';
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    showSuccess(`Image selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  };

  const handleUploadImage = async () => {
    if (!formData.image) {
      showError('Please select an image');
      return;
    }

    try {
      setStep('upload');
      const result = await uploadImage.mutateAsync({
        file: formData.image,
        metadata: {
          name: formData.name,
          description: formData.description,
          symbol: formData.symbol,
        },
      });

      setImageUrl(result.url);
      showSuccess('Image uploaded successfully');
      
      if (!publicKey) {
        showError('Please connect your wallet to continue');
        setStep('form');
        return;
      }

      setStep('draft');
      handleCreateDraft(result.url);
    } catch (error: any) {
      console.error('Image upload failed:', error);
      const errorMessage = error?.message || 'Failed to upload image';
      showError(errorMessage);
      setStep('form');
    }
  };

  const handleCreateDraft = async (uploadedImageUrl: string) => {
    if (!publicKey) {
      showError('Please connect your wallet');
      return;
    }

    try {
      if (uploadedImageUrl.length > 250) {
        showError(`Image URL is too long (${uploadedImageUrl.length} characters). Maximum is 250 characters.`);
        setStep('form');
        return;
      }

      const draftData: TokenDraftRequest = {
        name: formData.name.trim(),
        symbol: formData.symbol.trim().toUpperCase(),
        description: formData.description.trim(),
        decimals: formData.decimals,
        supply: formData.supply,
        photo: uploadedImageUrl,
        metadataUri: uploadedImageUrl,
        hardcap: formData.hardcap,
        website: formData.website?.trim() || undefined,
        x: formData.twitter?.trim() || undefined,
        telegram: formData.telegram?.trim() || undefined,
        version: 1,
      };

      if (!draftData.name || !draftData.symbol || !draftData.description) {
        showError('Name, symbol, and description are required');
        setStep('form');
        return;
      }

      showInfo('Creating token draft...');
      const result = await createDraft.mutateAsync(draftData);
      setTokenMint(result.token);
      showSuccess('Token draft created successfully');
      setStep('sign');

      handleSignToken(result.token);
    } catch (error: any) {
      console.error('Token draft creation failed:', error);
      console.error('Error details:', error?.details);
      
      let errorMessage = error?.message || 'Failed to create token draft';
      
      if (error?.details?.message) {
        if (Array.isArray(error.details.message)) {
          errorMessage = error.details.message.join(', ');
        } else {
          errorMessage = error.details.message;
        }
      }
      
      showError(errorMessage);
      setStep('form');
    }
  };

  const handleSignToken = async (tokenMintAddress: string) => {
    if (!publicKey || !signMessage) {
      showError('Wallet does not support message signing');
      return;
    }

    try {
      showInfo('Preparing transaction...');
      
      const signMessageResult = await getSignMessage.mutateAsync({
        wallet: publicKey.toString(),
        message: '',
      });

      const challenge = signMessageResult.code || signMessageResult.message;
      if (!challenge) {
        throw new Error('Failed to get signing challenge from API');
      }

      const messageToSign = new TextEncoder().encode(challenge);
      showInfo('Please sign the message in your wallet...');
      await signMessage(messageToSign);

      showInfo('Generating token transaction...');
      const txResult = await generateTokenTx.mutateAsync({
        tokenName: formData.name,
        tokenSymbol: formData.symbol,
        metadataUri: imageUrl,
        userPubkey: publicKey.toString(),
        firstBuyAmount: 100000000,
        fairlaunchHardcap: formData.hardcap * 1000000000,
        fairLaunchSupplyVariation: 0,
      });

      showInfo('Signing transaction...');
      const signedTxResult = await signTokenTx.mutateAsync({
        transaction: txResult.signedTransaction,
        token: tokenMintAddress,
      });

      if (sendTransaction && connection) {
        showInfo('Sending transaction to blockchain...');
        const transactionBuffer = bs58.decode(signedTxResult.signedTransaction);
        const transaction = VersionedTransaction.deserialize(transactionBuffer);
        
        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          maxRetries: 3,
        });

        showInfo('Waiting for confirmation...');
        await connection.confirmTransaction(signature, 'confirmed');
        showSuccess(`Token created successfully! Transaction: ${signature}`);
        setTokenMint(txResult.tokenMint);
      } else {
        setTokenMint(txResult.tokenMint);
        showSuccess('Token transaction prepared successfully!');
      }

      setStep('complete');
    } catch (error: any) {
      console.error('Token signing failed:', error);
      const errorMessage = error?.message || 'Failed to sign token transaction';
      showError(errorMessage);
      setStep('draft');
    }
  };

  return (
    <>
      <h1 className='text-3xl font-bold text-white mb-8'>Create New Token</h1>

      {step === 'form' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUploadImage();
          }}
          className='space-y-6'
        >
          <div className='bg-dark-card border border-dark-border rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-white mb-4'>Token Information</h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder='My Token'
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Symbol *</label>
                <input
                  type='text'
                  name='symbol'
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                  placeholder='MTK'
                  maxLength={10}
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Description *
                </label>
                <textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder='This is my token'
                  rows={4}
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary resize-vertical'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Image *</label>
                <input
                  type='file'
                  accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                  onChange={handleImageChange}
                  required
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:opacity-90'
                />
                <p className='text-xs text-gray-400 mt-1'>
                  Maximum file size: 1 MB. Supported formats: JPEG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>

          <div className='bg-dark-card border border-dark-border rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-white mb-4'>Token Economics</h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Decimals</label>
                <input
                  type='number'
                  name='decimals'
                  value={formData.decimals}
                  onChange={handleInputChange}
                  min={0}
                  max={9}
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Total Supply</label>
                <input
                  type='number'
                  name='supply'
                  value={formData.supply}
                  onChange={handleInputChange}
                  min={1}
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
                <p className='text-xs text-gray-400 mt-1'>Default: 1,000,000,000 (1B tokens)</p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Hardcap (SOL)
                </label>
                <input
                  type='number'
                  name='hardcap'
                  value={formData.hardcap}
                  onChange={handleInputChange}
                  min={1}
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
                <p className='text-xs text-gray-400 mt-1'>Maximum SOL to raise</p>
              </div>
            </div>
          </div>

          <div className='bg-dark-card border border-dark-border rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-white mb-4'>Social Links (Optional)</h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Website</label>
                <input
                  type='url'
                  name='website'
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder='https://example.com'
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Twitter/X Handle
                </label>
                <input
                  type='text'
                  name='twitter'
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder='@mytoken'
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>Telegram</label>
                <input
                  type='text'
                  name='telegram'
                  value={formData.telegram}
                  onChange={handleInputChange}
                  placeholder='https://t.me/mytoken'
                  className='w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary'
                />
              </div>
            </div>
          </div>

          <button
            type='submit'
            disabled={!publicKey}
            className='w-full py-4 bg-gradient-primary text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200'
          >
            {!publicKey ? 'Connect Wallet First' : 'Create Token'}
          </button>
        </form>
      )}

      {step === 'upload' && (
        <div className='bg-dark-card border border-dark-border rounded-lg p-12 text-center'>
          <div className='w-12 h-12 border-4 border-dark-lighter border-t-primary rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-300'>Uploading image to IPFS...</p>
        </div>
      )}

      {step === 'draft' && (
        <div className='bg-dark-card border border-dark-border rounded-lg p-12 text-center'>
          <div className='w-12 h-12 border-4 border-dark-lighter border-t-primary rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-300'>Creating token draft...</p>
        </div>
      )}

      {step === 'sign' && (
        <div className='bg-dark-card border border-dark-border rounded-lg p-12 text-center'>
          <div className='w-12 h-12 border-4 border-dark-lighter border-t-primary rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-300 mb-2'>Please sign the transaction in your wallet...</p>
          <p className='text-xs text-gray-500 font-mono break-all'>Token Mint: {tokenMint}</p>
        </div>
      )}

      {step === 'complete' && (
        <div className='bg-dark-card border-2 border-success rounded-lg p-12 text-center'>
          <h2 className='text-2xl font-bold text-success mb-4'>✅ Token Created Successfully!</h2>
          <p className='text-gray-300 mb-2'>Token Mint Address:</p>
          <code className='block px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-sm text-white font-mono break-all mb-6'>
            {tokenMint}
          </code>
          <a
            href={`https://solscan.io/token/${tokenMint}`}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-block px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-200'
          >
            View on Solscan
          </a>
        </div>
      )}
    </>
  );
};

