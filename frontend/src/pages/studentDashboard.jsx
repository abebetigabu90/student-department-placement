// import { useState, useEffect } from "react";
// import { useNavigate, Link as RouterLink } from "react-router-dom"; // use React Router
// import { Link } from "react-router-dom"; // optional if using <Link> for nav cards

// export default function StudentDashboard() {
//   const [studentData, setStudentData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const userType = localStorage.getItem("userType");
//     const storedData = localStorage.getItem("userData");

//     // Redirect if not student
//     if (!token || userType !== "student") {
//       navigate("/", { replace: true });
//       return;
//     }

//     if (storedData) {
//       setStudentData(JSON.parse(storedData));
//     }
    
//     setLoading(false);
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userType");
//     localStorage.removeItem("userData");
//     navigate("/", { replace: true });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-xl font-bold text-blue-700">DTU Student Portal</h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span className="text-gray-700">
//                 Welcome, {studentData?.firstName} {studentData?.middleName}
//               </span>
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* ...rest of your dashboard UI remains unchanged... */}
//         {/* Make sure to replace Next.js <Link href="/..."> with React Router <Link to="/..."> */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <Link to="/student/profile" className="block">
//             <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
//               My Profile
//             </div>
//           </Link>
//           <Link to="/student/preferences" className="block">
//             <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
//               Department Preferences
//             </div>
//           </Link>
//           <Link to="/student/results" className="block">
//             <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-500">
//               Placement Results
//             </div>
//           </Link>
//           <Link to="/student/academic" className="block">
//             <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-yellow-500">
//               Academic Records
//             </div>
//           </Link>
//           <Link to="/student/notifications" className="block">
//             <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-red-500">
//               Notifications
//             </div>
//           </Link>
//           <Link to="/student/support" className="block">
//             <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-gray-500">
//               Help & Support
//             </div>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
  Award,
  User,
} from "lucide-react";
import dtuLogo from "../assets/dtu-main-logo.png";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/student/login");
      return;
    }
    setStudent(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/student/login");
  };

  if (!student) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome card */}
          <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome, {student.firstName} {student.middleName} 👋
              </h2>
              <p className="text-gray-600 mt-1">
                Student ID: <span className="font-medium">{student.studentId}</span>
              </p>
            </div>
            <div className="text-blue-800">
              <GraduationCap size={60} />
            </div>
          </div>

          {/* Quick Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard
              icon={<User className="text-blue-600" size={30} />}
              title="Personal Info"
              value={`${student.gender}, ${student.region}`}
            />
            <DashboardCard
              icon={<BookOpen className="text-green-600" size={30} />}
              title="Current Stream"
              value={student.stream || "Not Assigned"}
            />
            <DashboardCard
              icon={<Award className="text-yellow-600" size={30} />}
              title="GPA / CGPA"
              value={student.cgpa || student.gpa || "N/A"}
            />
          </div>

          {/* Placement Progress Section */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ClipboardList className="text-blue-700" />
              Placement Progress
            </h3>

            <div className="relative w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className={`absolute top-0 left-0 h-4 rounded-full ${
                  student.Department ? "bg-green-500 w-full" : "bg-blue-500 w-1/2"
                }`}
              ></div>
            </div>

            {student.Department ? (
              <p className="text-green-700 font-medium">
                🎉 You have been placed in the{" "}
                <span className="font-semibold">{student.Department}</span>{" "}
                department.
              </p>
            ) : (
              <p className="text-gray-700">
                Your placement process is ongoing. Please check back after results
                are released.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/student/departmentPreferences")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md"
            >
              <BookOpen size={20} /> Update Department Preferences
            </button>

            <button
              onClick={() => navigate("/my/placement")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md"
            >
              <Award size={20} /> View Placement Result
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ icon, title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition duration-300">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-700 font-semibold">{title}</h4>
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
