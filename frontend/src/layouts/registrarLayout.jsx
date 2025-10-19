import { Outlet, Link, useNavigate } from "react-router-dom";

export default function RegistrarLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Header */}
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Registrar Panel</h1>

        <nav className="space-x-4">
          <Link to="/registrar/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/registrar/import/students" className="hover:underline">
            Import Students
          </Link>
          <Link to="/registrar/create-students" className="hover:underline">
            Create Student
          </Link>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 font-semibold px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* ✅ Page Content (children pages) */}
      <main className="flex-grow p-6 bg-gray-50">
        <Outlet />
      </main>

      {/* ✅ Footer */}
      <footer className="bg-gray-200 text-center py-3 text-sm text-gray-600">
        © {new Date().getFullYear()} Department Placement System — Registrar Panel
      </footer>
    </div>
  );
}



// import { Outlet, Link, useNavigate } from "react-router-dom";
// import dtuLogo from "./assets/dtu_logo.png"; // 👈 path to your logo file

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
//               Registrar — Department Placement System
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
