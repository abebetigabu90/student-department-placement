import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import dtuLogo from "../assets/dtu-main-logo.png";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { path: "/student/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/student/departmentPreferences", label: "Submit Preferences", icon: "📝" },
    { path: "/my/preferences", label: "My Preferences", icon: "📋" },
    { path: "/my/placement", label: "My Placement", icon: "🎓" },
    { path: "/student/change-password", label: "Change Password", icon: "🔒" },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-green-50">
      {/* ✅ Enhanced Header - Green Theme for Students */}
      <header className="bg-gradient-to-r from-green-700 to-emerald-600 shadow-lg border-b border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                <img
                  src={dtuLogo}
                  alt="Debre Tabor University Logo"
                  className="h-12 w-auto"
                />
                <div className="border-l border-white/30 h-10"></div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Debre Tabor University
                  </h1>
                  <p className="text-sm text-emerald-100 font-medium">
                    Student Portal - Placement System
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
                    ${isActiveLink(item.path)
                      ? "bg-white text-green-800 shadow-md"
                      : "text-white hover:bg-white/20 hover:text-white"
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Logout Button */}
              <div className="border-l border-white/30 h-8 mx-2"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white text-green-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ✅ Enhanced Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ✅ Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <img
                  src={dtuLogo}
                  alt="DTU Logo"
                  className="h-6 w-auto"
                />
              </div>
              <div>
                <p className="font-semibold">Debre Tabor University</p>
                <p className="text-gray-300 text-sm">Excellence in Education</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm">
                © {new Date().getFullYear()} Department Placement System
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Student Portal • Your Academic Journey
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}