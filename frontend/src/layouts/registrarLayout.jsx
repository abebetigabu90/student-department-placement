// // import { Outlet, Link, useNavigate } from "react-router-dom";

// // export default function RegistrarLayout() {
// //   const navigate = useNavigate();

// //   const handleLogout = () => {
// //     localStorage.clear();
// //     navigate("/login");
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col">
// //       {/* ✅ Header */}
// //       <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
// //         <h1 className="text-xl font-bold">Registrar Panel</h1>

// //         <nav className="space-x-4">
// //           <Link to="/registrar/dashboard" className="hover:underline">
// //             Dashboard
// //           </Link>
// //           <Link to="/registrar/import/students" className="hover:underline">
// //             Import Students
// //           </Link>
// //           <Link to="/registrar/create-students" className="hover:underline">
// //             Create Student
// //           </Link>
// //           <button
// //             onClick={handleLogout}
// //             className="bg-white text-indigo-600 font-semibold px-3 py-1 rounded-lg hover:bg-gray-100"
// //           >
// //             Logout
// //           </button>
// //         </nav>
// //       </header>

// //       {/* ✅ Page Content (children pages) */}
// //       <main className="flex-grow p-6 bg-gray-50">
// //         <Outlet />
// //       </main>

// //       {/* ✅ Footer */}
// //       <footer className="bg-gray-200 text-center py-3 text-sm text-gray-600">
// //         © {new Date().getFullYear()} Department Placement System — Registrar Panel
// //       </footer>
// //     </div>
// //   );
// // }



// import { Outlet, Link, useNavigate } from "react-router-dom";
// import dtuLogo from "../assets/dtu-main-logo.png"; // 👈 path to your logo file

// export default function RegistrarLayout() {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* ✅ Header with logo */}
//       <header className="bg-white shadow-md flex justify-between items-center px-6 py-3 border-b">
//         <div className="flex items-center space-x-3">
//           <img
//             src={dtuLogo}
//             alt="Debre Tabor University Logo"
//             className="h-12 w-auto"
//           />
//           <div>
//             <h1 className="text-lg font-bold text-indigo-700">
//               Debre Tabor University
//             </h1>
//             <p className="text-sm text-gray-500">
//               Department Placement System
//             </p>
//           </div>
//         </div>

//         <nav className="space-x-4">
//           <Link
//             to="/registrar/dashboard"
//             className="text-gray-700 hover:text-indigo-600 font-medium"
//           >
//             Dashboard
//           </Link>
//           <Link
//             to="/registrar/import/students"
//             className="text-gray-700 hover:text-indigo-600 font-medium"
//           >
//             Import Students
//           </Link>
//           <Link
//             to="/registrar/create-students"
//             className="text-gray-700 hover:text-indigo-600 font-medium"
//           >
//             Create Student
//           </Link>
//           <button
//             onClick={handleLogout}
//             className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition"
//           >
//             Logout
//           </button>
//         </nav>
//       </header>

//       {/* ✅ Page Content */}
//       <main className="flex-grow p-6 bg-gray-50">
//         <Outlet />
//       </main>

//       {/* ✅ Footer */}
//       <footer className="bg-gray-200 text-center py-3 text-sm text-gray-600">
//         © {new Date().getFullYear()} Debre Tabor University — Registrar Panel
//       </footer>
//     </div>
//   );
// }




import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import dtuLogo from "../assets/dtu-main-logo.png";

export default function RegistrarLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { path: "/registrar/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/registrar/import/students", label: "Import Students", icon: "📥" },
    { path: "/registrar/create-students", label: "Create Student", icon: "👨‍🎓" },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ✅ Blue Header Theme */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-lg border-b border-blue-500">
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
                  <p className="text-sm text-blue-100 font-medium">
                    Registrar Management System
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
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isActiveLink(item.path)
                      ? "bg-white text-blue-800 shadow-md"
                      : "text-white hover:bg-white/20 hover:text-white"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Logout Button */}
              <div className="border-l border-white/30 h-8 mx-2"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white text-blue-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* ✅ Main Content */}
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ✅ Footer */}
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
                Registrar Panel • Secure Management Portal
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}