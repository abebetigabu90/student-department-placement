import { Outlet, Link, useLocation } from "react-router-dom";
import dtuLogo from "../assets/dtu-main-logo.png";

export default function PublicLayout() {
  const location = useLocation();
  
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src={dtuLogo}
                alt="Debre Tabor University"
                className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Debre Tabor University
                </h1>
                <p className="text-xs text-gray-600">Placement System</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`font-medium transition-colors duration-200 ${
                  isActiveLink("/") 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`font-medium transition-colors duration-200 ${
                  isActiveLink("/about") 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`font-medium transition-colors duration-200 ${
                  isActiveLink("/contact") 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* University Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={dtuLogo}
                  alt="Debre Tabor University"
                  className="h-12 w-auto"
                />
                <div>
                  <h3 className="text-xl font-bold">Debre Tabor University</h3>
                  <p className="text-gray-300 text-sm">Department Placement System</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                A comprehensive platform for streamlined department placement, 
                ensuring fair and optimal allocation of students based on merit and preferences.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                  <span className="text-lg">📘</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                  <span className="text-lg">🐦</span>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-200 cursor-pointer">
                  <span className="text-lg">📷</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                    About System
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* System Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">System Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>System Operational</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Placement Active</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>24/7 Support</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <p className="text-sm font-medium mb-2">Need Help?</p>
                <p className="text-xs text-gray-400 mb-3">
                  Contact our support team for assistance
                </p>
                <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} Debre Tabor University. All rights reserved.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link to="/accessibility" className="hover:text-white transition-colors duration-200">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}