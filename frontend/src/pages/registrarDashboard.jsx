import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegistrarDashboard() {
  const [registrar, setRegistrar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    const userType = localStorage.getItem("userType");

    if (!storedUser || userType !== "registrar") {
      navigate("/login");
      return;
    }
    setRegistrar(storedUser);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">
          Registrar Dashboard
        </h1>

        {registrar && (
          <p className="text-lg text-gray-700 mb-6">
            Welcome, <span className="font-semibold">{registrar.name}</span> 👋
          </p>
        )}

        <div className="flex flex-col space-y-4">
          <Link
            to="/registrar/import/students"
            className="block bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Import Students
          </Link>

          <Link
            to="/registrar/create-students"
            className="block bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Create Student
          </Link>

          <Link
            to="/admin/viewStudents"
            className="block bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            View Students Result
          </Link>
        </div>
      </div>
    </div>
  );
}
