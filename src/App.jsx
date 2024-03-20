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
import { CREATE_LISTING, EDIT_LISTING, FORGOT_PASSWORD, HOME, OFFERS, PROFILE, SIGN_IN, SIGN_UP } from './constants';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';

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
          <Route path={CREATE_LISTING.href} element={<PrivateRoute />}>
            <Route path={CREATE_LISTING.href} element={<CreateListing />} />
          </Route>
          <Route path={EDIT_LISTING.href} element={<PrivateRoute />}>
            <Route path={`${EDIT_LISTING.href}/:listingId`} element={<EditListing />} />
          </Route>
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
