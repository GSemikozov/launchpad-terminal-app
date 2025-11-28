import { useNavigate } from 'react-router-dom';
import { PlusIcon, MenuIcon } from '@shared/ui/icons';
import { Button } from '@shared/ui';
import { WalletButton } from '@features/wallet';
import { useWalletInfo } from '@features/wallet/hooks/useWalletInfo';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { connected } = useWalletInfo();

  return (
    <header className='border-b border-dark-border bg-dark/50 backdrop-blur-lg sticky top-0 z-40'>
      <div className='px-4 lg:container lg:mx-auto h-16 flex items-center'>
        <div className='flex items-center justify-between w-full gap-3'>
          {onMenuClick && (
            <button
              type='button'
              onClick={onMenuClick}
              className='inline-flex items-center justify-center rounded-xl border border-dark-border bg-dark-card p-2 text-gray-300 hover:text-white hover:border-primary lg:hidden'
              aria-label='Open menu'
            >
              <MenuIcon className='h-6 w-6' />
            </button>
          )}

          <div className='flex items-center gap-3 ml-auto'>
            <Button
              variant='primary'
              className='flex items-center gap-2'
              onClick={() => navigate('/create-token')}
            >
              <PlusIcon className='h-5 w-5' />
              <span className='hidden sm:inline'>Create coin</span>
            </Button>

            {connected && null}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
