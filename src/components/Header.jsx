import { useLocation, useNavigate } from 'react-router-dom';
import logo from '/realtor-logo.svg';
import { NAV_LINKS, PROFILE, SIGN_IN, HOME } from '../constants';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageState, setPageState] = useState(PROFILE.label);
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState(PROFILE.label);
      } else {
        setPageState(SIGN_IN.label);
      }
    });
  }, []);

  const pathMatchRoute = (route) => {
    return route === location.pathname;
  };

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img src={logo} alt="realtor logo" className="h-5 cursor-pointer" onClick={() => navigate(HOME.href)} />
        </div>

        <div>
          <ul className="flex space-x-10">
            {NAV_LINKS.map((link) => (
              <li
                key={link.key}
                className={`py-3 text-sm font-semibold cursor-pointer border-b-[3px] ${
                  link.href === SIGN_IN.href
                    ? pathMatchRoute(PROFILE.href) || pathMatchRoute(SIGN_IN.href)
                      ? 'text-black border-red-500'
                      : 'text-gray-400 border-b-transparent'
                    : pathMatchRoute(link.href)
                    ? 'text-black border-red-500'
                    : 'text-gray-400 border-b-transparent'
                }`}
                onClick={() => navigate(link.href === SIGN_IN.href ? PROFILE.href : link.href)}
              >
                {link.label === SIGN_IN.label ? pageState : link.label}
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default Header;
