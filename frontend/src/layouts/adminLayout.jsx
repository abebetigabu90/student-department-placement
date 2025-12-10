import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import dtuLogo from "../assets/dtu-main-logo.png";
import { useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { 
      path: "/admin/dashboard", 
      label: "Dashboard", 
      icon: "📊"
    },
    { 
      path: "/admin/runNaturalFistSemPlacement", 
      label: "1st Semister Natural Science Placement", 
      icon: "🔬"
    },
    { 
      path: "/admin/runSocialFistSemPlacement", 
      label: "1st Semister Social Science Placement", 
      icon: "🌍"
    },
    { 
      path: "/admin/runPreEngineeringPlacement", 
      label: "2nd Semister Pre Engineering Placement", 
      icon: "🔬"
    },
    // { 
    //   path: "/admin/runOtherNaturalPlacement", 
    //   label: "2nd Semister Other Natural Placement", 
    //   icon: "🔬"
    // },
    // { 
    //   path: "/admin/runOtherSocialPlacement", 
    //   label: "2nd Semister Other Social Placement", 
    //   icon: "🌍"
    // },
    { 
      path: "/admin/view/preferences", 
      label: "View Preferences", 
      icon: "📋"
    },
    { 
      path: "/admin/view/placements", 
      label: "View Placements", 
      icon: "🎓"
    },
    { 
      path: "/admin/preference/setting", 
      label: "Preference Settings", 
      icon: "⚙️"
    },
    { 
      path: "/admin/clear/AllPlacements", 
      label: "Clear Placements", 
      icon: "🗑️"
    },
    { 
      path: "/admin/manage/departments", 
      label: "Manage Departments", 
      icon: "🏛️"
    },
    { 
      path: "/admin/view/Reports", 
      label: "View Reports", 
      icon: "📈"
    },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ✅ Top Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-600 shadow-lg border-b border-purple-500">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-white hover:bg-white/20 transition-colors mr-4"
            >
              <span className="text-2xl">☰</span>
            </button>
            
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-md text-white hover:bg-white/20 transition-colors mr-4"
            >
              <span className="text-xl">≡</span>
            </button>
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 py-3">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-2 shadow-sm">
                <img
                  src={dtuLogo}
                  alt="Debre Tabor University Logo"
                  className="h-10 w-auto"
                />
                <div className="border-l border-white/30 h-8"></div>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Debre Tabor University
                  </h1>
                  <p className="text-xs text-purple-100 font-medium">
                    Department lacement System
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* ✅ Sidebar Navigation with Fixed Scrollbar */}
        <aside className={`
          bg-gradient-to-b from-slate-50 to-gray-100 shadow-xl border-r border-gray-200 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-0 lg:w-0'} 
          fixed lg:static inset-y-0 left-0 z-40 overflow-hidden flex flex-col
        `}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white text-lg">⚡</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                  <p className="text-xs text-indigo-200 font-medium">Placement Management</p>
                </div>
              </div>
            </div>

            {/* Navigation Items with Proper Scrollbar */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 scrollbar-thumb-rounded-full">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative
                      ${isActiveLink(item.path)
                        ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-l-4 hover:border-indigo-300"
                      }
                    `}
                  >
                    <span className={`
                      text-xl flex-shrink-0 transition-transform duration-200
                      ${isActiveLink(item.path) ? "scale-110" : "group-hover:scale-110"}
                    `}>
                      {item.icon}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                    </div>

                    {/* Active Indicator */}
                    {isActiveLink(item.path) && (
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    )}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">System Admin</p>
                  <p className="text-xs text-indigo-100 truncate">Full Access</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ✅ Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ✅ Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'} min-w-0`}>
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* ✅ Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-2 md:mb-0">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <img
                  src={dtuLogo}
                  alt="DTU Logo"
                  className="h-4 w-auto"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">Debre Tabor University</p>
                <p className="text-xs text-gray-300">Placement Administration</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-xs">
                © {new Date().getFullYear()} Department Placement System
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Admin Control Panel • Secure Access
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ Add custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-rounded-full::-webkit-scrollbar-thumb {
          border-radius: 10px;
        }
        .scrollbar-thumb-gray-400::-webkit-scrollbar-thumb {
          background-color: #9CA3AF;
        }
        .scrollbar-thumb-gray-400::-webkit-scrollbar-thumb:hover {
          background-color: #6B7280;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background-color: #F3F4F6;
        }
      `}</style>
    </div>
  );
}