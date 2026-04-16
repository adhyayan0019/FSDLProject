import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Booking', path: '/booking' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center px-4 font-sans">
      <nav className="bg-white shadow-lg rounded-full flex flex-wrap items-center justify-between px-2 py-2 w-auto max-w-4xl relative">

        {/* Logo */}
        <Link to="/" className="font-sans font-bold text-xl text-primary font-medium px-4">
          Khalsa Punjab
        </Link>

        {/* Mobile Toggle inside Pill */}
        <button
          className="md:hidden p-2 text-primary focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
        </button>

        {/* Links Container */}
        <div className={`w-full md:w-auto md:flex items-center gap-x-2 md:gap-x-4 ${isOpen ? 'flex flex-col gap-y-2 mt-4 md:mt-0' : 'hidden'} md:static absolute top-full left-0 bg-white md:bg-transparent rounded-2xl md:rounded-none shadow-md md:shadow-none p-4 md:p-0`}>

          {/* Main Nav Links */}
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${active
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-surface-variant hover:text-gray-900 bg-transparent'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Auth-specific links */}
          {user && (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${isActive('/admin')
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-surface-variant hover:text-gray-900 bg-transparent'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className={`flex items-center px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${isActive('/profile')
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-surface-variant hover:text-gray-900 bg-transparent'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            </>
          )}

          {/* Auth Actions inside the pill */}
          <div className="pl-2 border-l border-gray-200 mt-2 md:mt-0 pt-2 md:pt-0">
            {user ? (
              <button
                className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                onClick={() => { logout(); setIsOpen(false); }}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
