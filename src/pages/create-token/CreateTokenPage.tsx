import { useState } from 'react';
import { Sidebar } from '@widgets/Sidebar';
import { Header } from '@widgets/Header';
import { CreateTokenForm } from '@features/token';

export function CreateTokenPage() {
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
          <CreateTokenForm />
        </main>
      </div>
    </div>
  );
}
