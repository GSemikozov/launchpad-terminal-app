import { useState } from 'react';
import { Sidebar } from '@widgets/Sidebar';
import { Header } from '@widgets/Header';
import { OrdersList } from '@widgets/Orders/OrdersList';

export function OrdersPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-dark flex'>
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className='flex-1 lg:ml-64'>
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className='w-full px-4 py-8 xl:container xl:mx-auto'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-white'>My Orders</h1>
            <p className='text-gray-400 mt-2'>Manage your limit orders</p>
          </div>
          <OrdersList />
        </main>
      </div>
    </div>
  );
}
