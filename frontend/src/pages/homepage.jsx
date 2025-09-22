// src/pages/Homepage.jsx
import { Link } from "react-router-dom";

export default function Homepage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-6">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4 text-center">
        Debre Tabor University
      </h1>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-8 text-center">
        Student Department Placement System
      </h2>

      {/* Card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <p className="text-gray-600 mb-6">
          Welcome! Please login or create an account to manage your placement.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            className="w-full py-2 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="w-full py-2 px-4 rounded-xl border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            Signup
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="text-sm text-gray-500 mt-10">
        © {new Date().getFullYear()} Debre Tabor University
      </p>
    </div>
  );
}
