// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, LogIn } from 'lucide-react';
// import api from '../utils/api';
// import { login } from '../utils/auth';

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await api.post('/admin/login', formData);
//       login(response.data.token);
//       navigate('/');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
//             <LogIn className="h-6 w-6 text-primary-600" />
//           </div>
//           <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
//             Admin Login
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Sign in to access the placement system
//           </p>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//               {error}
//             </div>
//           )}
//           <div className="space-y-4">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email Address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 required
//                 className="input-field mt-1"
//                 placeholder="admin@example.com"
//                 value={formData.email}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-1 relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   className="input-field pr-10"
//                   placeholder="Enter your password"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-primary w-full flex justify-center items-center"
//             >
//               {loading ? (
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </div>
          
//           <div className="text-center text-sm text-gray-600">
//             <p>Default credentials:</p>
//             <p>Email: admin@example.com</p>
//             <p>Password: Admin@123</p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;




import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const apiUrl =
        userType === "student" ? "http://localhost:5000/api/student/login" : "http://localhost:5000/api/admin/login";

      const requestData =
        userType === "student"
          ? { studentId: formData.username, password: formData.password }
          : { email: formData.username, password: formData.password };

      const response = await axios.post(apiUrl, requestData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", response.data.userType);
        const userData = response.data.userType === 'student' ? response.data.student : response.data.admin;
        localStorage.setItem("userData", JSON.stringify(userData));
         alert('Login successful');
         navigate(`/${response.data.userType}/dashboard`);
      } else {
        setMessage(response.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Department Placement System
        </h1>

        {/* User Type Toggle */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setUserType("student")}
            className={`px-4 py-2 rounded-l-md border ${
              userType === "student"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType("admin")}
            className={`px-4 py-2 rounded-r-md border ${
              userType === "admin"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={userType === "student" ? "Student ID" : "Email"}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}
