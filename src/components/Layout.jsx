import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isHomeRoute = location.pathname === '/';

  if (isAdminRoute || isSellerRoute) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#E8EAF0]">
      <Navbar />
      <main className={`${isHomeRoute ? 'py-0' : 'page-shell py-8 sm:py-10'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
