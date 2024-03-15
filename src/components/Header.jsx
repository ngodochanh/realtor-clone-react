import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/realtor-logo.svg';
import { NAV_LINKS } from '../constants';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathMathRoute = (route) => {
    if (route === location.pathname) {
      return true;
    }
  };

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img src={logo} alt="realtor logo" className="h-5 cursor-pointer" onClick={() => navigate('/')} />
        </div>

        <div>
          <ul className="flex space-x-10">
            {NAV_LINKS.map((link) => (
              <li
                key={link.key}
                className={`py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent cursor-pointer ${
                  pathMathRoute(link.href) && 'text-black border-b-red-500'
                }`}
                onClick={() => navigate(link.href)}
              >
                {link.label}
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default Header;
