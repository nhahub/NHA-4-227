import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { logout } from './redux/slices/authSlice';
import { getProfile } from './services/authService';

const AppInner = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) return;
    getProfile().catch(() => dispatch(logout()));
  }, []);

  return <AppRoutes />;
};

const App = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
);

export default App;
