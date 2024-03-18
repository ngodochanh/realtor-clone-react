import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Offers from './pages/Offers';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import { FORGOT_PASSWORD, HOME, OFFERS, PROFILE, SIGN_IN, SIGN_UP } from './constants';

function App() {
  return (
    <>
      <Router>
        <Header />

        <Routes>
          <Route path={HOME.href} element={<Home />} />
          <Route path={PROFILE.href} element={<PrivateRoute />}>
            <Route path={PROFILE.href} element={<Profile />} />
          </Route>
          <Route path={SIGN_IN.href} element={<SignIn />} />
          <Route path={SIGN_UP.href} element={<SignUp />} />
          <Route path={FORGOT_PASSWORD.href} element={<ForgotPassword />} />
          <Route path={OFFERS.href} element={<Offers />} />
        </Routes>
      </Router>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
