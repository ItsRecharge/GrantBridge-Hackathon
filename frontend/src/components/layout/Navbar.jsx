import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '' },
    { label: 'Colleges', path: '/colleges', icon: '' },
    { label: 'Scholarships', path: '/scholarships', icon: '' },
    { label: 'FAFSA Helper', path: '/fafsa-helper', icon: '' },
    { label: 'Profile', path: '/profile', icon: '' },
  ];

  const educationNav = { label: 'Education Hub', path: '/education', icon: '' };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-2xl font-bold text-black-600 hover:text-black-800 transition"
            >
              GrantBridge
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <button
              onClick={() => navigate(educationNav.path)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition border ${
                isActive(educationNav.path)
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}
            >
              {educationNav.icon} {educationNav.label}
            </button>
          </div>

          {/* Desktop User Dropdown */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              <span>👤</span>
              <span className="text-sm max-w-xs truncate">{user?.email}</span>
              <svg
                className={`w-4 h-4 transition transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10">
                <div className="px-4 py-2 border-b text-sm text-gray-600">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className={`w-6 h-6 transition transform ${mobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}

            <div className="px-3 mt-2">
              <button
                onClick={() => {
                  navigate(educationNav.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition border ${
                  isActive(educationNav.path)
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {educationNav.icon} {educationNav.label}
              </button>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="px-4 py-2 text-sm text-gray-600">{user?.email}</div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
