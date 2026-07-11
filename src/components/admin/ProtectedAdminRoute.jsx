import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedAdminRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
