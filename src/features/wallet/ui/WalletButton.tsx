import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import classNames from 'classnames';

export interface WalletButtonProps {
  className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
  const { connected } = useWallet();

  return (
    <WalletMultiButton
      className={classNames(
        '!bg-gradient-primary !border-0 !rounded-xl !px-4 !py-2.5',
        '!font-semibold !transition-all !duration-200',
        'hover:!opacity-90 hover:!shadow-[0_0_20px_rgba(255,0,255,0.5)]',
        '!outline-none focus:!ring-2 focus:!ring-primary focus:!ring-offset-2 focus:!ring-offset-dark',
        connected && '!bg-gradient-secondary',
        className
      )}
    />
  );
}
