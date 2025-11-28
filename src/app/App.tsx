import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '@pages/home';
import { CreateTokenPage } from '@pages/create-token';
import { OrdersPage } from '@pages/orders';
import { ProfilePage } from '@pages/profile';
import { AppProvider } from './providers';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/create-token' element={<CreateTokenPage />} />
          <Route path='/orders' element={<OrdersPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
