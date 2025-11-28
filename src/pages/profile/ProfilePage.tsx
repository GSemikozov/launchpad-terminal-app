import { useState } from 'react';
import { Sidebar } from '@widgets/Sidebar';
import { Header } from '@widgets/Header';
import { UserProfile } from '@features/profile';
import { Portfolio } from '@widgets/portfolio';
import { useWallet } from '@solana/wallet-adapter-react';

export function ProfilePage() {
  const { connected } = useWallet();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-dark flex'>
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className='flex-1 lg:ml-64'>
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className='w-full px-4 py-8 lg:container lg:mx-auto lg:max-w-4xl'>
          {connected ? (
            <div className='space-y-8'>
              <UserProfile />
              <Portfolio />
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg'>
                Please connect your wallet to view your profile
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
