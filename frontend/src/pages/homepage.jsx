// // src/pages/Homepage.jsx
// import { Link } from "react-router-dom";

// export default function Homepage() {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6">
//       {/* Header */}
//       <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4 text-center">
//         Debre Tabor University
//       </h1>
//       <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-8 text-center">
//         Student Department Placement System
//       </h2>

//       {/* Card */}
//       <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
//         <p className="text-gray-600 mb-6">
//           Welcome! Please login or create an account to manage your placement.
//         </p>

//         <div className="flex flex-col gap-4">
//           <Link
//             to="/login"
//             className="w-full py-2 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
//           >
//             Login
//           </Link>
//         </div>
//       </div>

//       {/* Footer */}
//       <p className="text-sm text-gray-500 mt-10">
//         © {new Date().getFullYear()} Debre Tabor University
//       </p>
//     </div>
//   );
// }


import { Link } from "react-router-dom";
import dtuLogo from "../assets/dtu-main-logo.png"; // Make sure to import your logo

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to the
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Department Placement System
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Streamlined department placement system for students. 
              Submit your preferences, track placements, and manage your academic journey seamlessly.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Placement</h3>
              <p className="text-gray-600 text-sm">
                Submit your department preferences and get placed based on merit and choice
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Placement System</h3>
              <p className="text-gray-600 text-sm">
                Advanced placement System ensuring fair and optimal department allocation
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor your placement status and results in real-time with detailed analytics
              </p>
            </div>
          </div>

          {/* Login CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6">
              Access the placement system to manage your department preferences and track your placement status.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full bg-white text-blue-600 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg text-center"
              >
                🚀 Login to Portal
              </Link>
              <p className="text-blue-200 text-sm">
                Secure access for registered students and staff
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
