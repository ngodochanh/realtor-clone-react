import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { SIGN_IN } from '../constants';
import Spinner from './Spinner';

function PrivateRoute() {
  const { loggedIn, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    return <Spinner />;
  }

  // <Outlet /> là một thành phần được sử dụng để hiển thị nội dung của các tuyến đường con (nested routes)
  return loggedIn ? <Outlet /> : <Navigate to={SIGN_IN.href} />;
}

export default PrivateRoute;
