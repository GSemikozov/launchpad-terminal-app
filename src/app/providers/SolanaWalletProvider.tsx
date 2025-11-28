import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { type ReactNode, useMemo } from 'react';
import { useWalletAdapters } from '@shared/lib/wallet';

import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
  endpoint?: string;
}

export function SolanaWalletProvider({
  children,
  network = WalletAdapterNetwork.Mainnet,
  endpoint,
}: SolanaWalletProviderProps) {
  const rpcEndpoint = useMemo(() => {
    if (endpoint) return endpoint;
    return clusterApiUrl(network);
  }, [endpoint, network]);

  const wallets = useWalletAdapters(network);

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
