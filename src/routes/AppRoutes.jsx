import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import MyOrders from '../pages/MyOrders';
import OrderDetails from '../pages/OrderDetails';
import Notifications from '../pages/Notifications';
import AdminLayout from '../components/admin/AdminLayout';
import ProtectedAdminRoute from '../components/admin/ProtectedAdminRoute';
import ProtectedStaffRoute from '../components/admin/ProtectedStaffRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminCreateUser from '../pages/admin/AdminCreateUser';
import AdminSupportTickets from '../pages/admin/AdminSupportTickets';
import AdminProductRequests from '../pages/admin/AdminProductRequests';
import SellerLayout from '../components/seller/SellerLayout';
import ProtectedSellerRoute from '../components/seller/ProtectedSellerRoute';
import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerProducts from '../pages/seller/SellerProducts';
import SellerCreateProduct from '../pages/seller/SellerCreateProduct';
import SellerEditProduct from '../pages/seller/SellerEditProduct';
import SellerOrders from '../pages/seller/SellerOrders';
import SellerInventory from '../pages/seller/SellerInventory';
import SellerPaymentSettings from '../pages/seller/SellerPaymentSettings';
import SupportTickets from '../pages/support/SupportTickets';
import CreateSupportTicket from '../pages/support/CreateSupportTicket';
import SupportTicketDetails from '../pages/support/SupportTicketDetails';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="support" element={<SupportTickets />} />
        <Route path="support/new" element={<CreateSupportTicket />} />
        <Route path="support/tickets/:id" element={<SupportTicketDetails />} />
        <Route
          path="seller"
          element={
            <ProtectedSellerRoute>
              <SellerLayout />
            </ProtectedSellerRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<SellerCreateProduct />} />
          <Route path="products/edit/:id" element={<SellerEditProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="payment-settings" element={<SellerPaymentSettings />} />
        </Route>
        <Route
          path="admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="product-requests" element={<AdminProductRequests />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="create-user" element={<AdminCreateUser />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route
          path="admin/support"
          element={
            <ProtectedStaffRoute>
              <AdminLayout />
            </ProtectedStaffRoute>
          }
        >
          <Route index element={<AdminSupportTickets />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
