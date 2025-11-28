import { NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { RocketIcon, PlusIcon, UserIcon, ChartIcon, XIcon } from '@shared/ui/icons';
import { useClickOutside } from '@shared/lib/useClickOutside';
import { useTokenPrices } from '@shared/lib/centrifugo';
import classNames from 'classnames';

const navigation = [
  { name: 'Home', href: '/', icon: RocketIcon },
  { name: 'Create Coin', href: '/create-token', icon: PlusIcon },
  { name: 'My Orders', href: '/orders', icon: ChartIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface SidebarContentProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

function SidebarContent({ onClose, showCloseButton }: SidebarContentProps) {
  const { isConnected: wsConnected, error: wsError } = useTokenPrices();

  return (
    <div className='h-full w-64 bg-dark border-r border-dark-border flex flex-col'>
      {/* Logo */}
      <div className='h-16 px-6 border-b border-dark-border flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <RocketIcon className='h-8 w-8 text-primary' />
          <span className='text-xl font-bold bg-gradient-primary bg-clip-text text-transparent'>
            Launchpad
          </span>
        </div>
        {showCloseButton && onClose && (
          <button
            type='button'
            onClick={onClose}
            className='lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-lighter transition-colors'
            aria-label='Close menu'
          >
            <XIcon className='h-6 w-6' />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-1'>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-dark-lighter',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-400 hover:text-white'
              )
            }
          >
            <item.icon className='h-5 w-5' />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className='px-4 py-3 border-t border-dark-border'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-400'>System Status</span>
          {wsConnected && !wsError ? (
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30'>
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-success'></span>
              </span>
              <span className='text-xs font-medium text-success'>Live</span>
            </div>
          ) : (
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-500/10 border border-gray-500/30' title={wsError?.message || 'Disconnected'}>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-gray-500'></span>
              <span className='text-xs font-medium text-gray-500'>Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className='p-4 border-t border-dark-border'>
        <div className='text-xs text-gray-500 text-center'>v1.0.0 • Made with 🚀</div>
      </div>
    </div>
  );
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useClickOutside(sidebarRef, () => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className='fixed left-0 top-0 hidden h-screen lg:flex'>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <div
        className={classNames(
          'fixed inset-0 z-50 lg:hidden transition-opacity duration-200',
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className={classNames(
            'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={onMobileClose}
        />
        <div
          ref={sidebarRef}
          className={classNames(
            'h-full w-64 bg-dark border-r border-dark-border transition-transform duration-200 ease-out',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SidebarContent onClose={onMobileClose} showCloseButton />
        </div>
      </div>
    </>
  );
}
