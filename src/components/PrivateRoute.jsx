import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { SIGN_IN } from '../constants';

function PrivateRoute() {
  const { loggedIn, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    return <h3>Loading...</h3>;
  }

  // <Outlet /> là một thành phần được sử dụng để hiển thị nội dung của các tuyến đường con (nested routes)
  return loggedIn ? <Outlet /> : <Navigate to={SIGN_IN.href} />;
}

export default PrivateRoute;
