import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

export function useWalletInfo() {
  const { publicKey, connected, connecting, disconnecting } = useWallet();

  const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const shortAddress = useMemo(() => {
    if (!walletAddress) return '';
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  return {
    walletAddress,
    shortAddress,
    connected,
    connecting,
    disconnecting,
    publicKey,
  };
}
