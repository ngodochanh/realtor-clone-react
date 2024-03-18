import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false); // kiểm tra xem người dùng có được xác thực hay không?
  const [checkingStatus, setCheckingStatus] = useState(true); // kiểm tra thông tin có đến hay không

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      }
      setCheckingStatus(false);
    });
  }, []);

  return { loggedIn, checkingStatus };
}

export { useAuthStatus };
