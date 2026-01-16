// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function LoginPage() {
//   const [userType, setUserType] = useState("student");
//   const [formData, setFormData] = useState({ username: "", password: "" });
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       const apiUrl =
//         userType === "student" ? "http://localhost:5000/api/student/login" : "http://localhost:5000/api/admin/login";

//       const requestData =
//         userType === "student"
//           ? { studentId: formData.username, password: formData.password }
//           : { email: formData.username, password: formData.password };

//       const response = await axios.post(apiUrl, requestData);

//       if (response.data.success) {
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("userType", response.data.userType);
//         const userData = response.data.userType === 'student' ? response.data.student : response.data.admin;
//         localStorage.setItem("userData", JSON.stringify(userData));
//          alert('Login successful');
//         // ✅ If default password, redirect to change password page
//         if (response.data.isDefaultPassword) {
//         navigate("/student/change-password");
//        }
//        else{
//          navigate(`/${response.data.userType}/dashboard`);
//        }
//       } else {
//         setMessage(response.data.message);
//       }
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Login failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
//       <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
//         <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
//           Department Placement System
//         </h1>

//         {/* User Type Toggle */}
//         <div className="flex justify-center mb-6">
//           <button
//             type="button"
//             onClick={() => setUserType("student")}
//             className={`px-4 py-2 rounded-l-md border ${
//               userType === "student"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-100 text-gray-700"
//             }`}
//           >
//             Student
//           </button>
//           <button
//             type="button"
//             onClick={() => setUserType("admin")}
//             className={`px-4 py-2 rounded-r-md border ${
//               userType === "admin"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-100 text-gray-700"
//             }`}
//           >
//             Admin
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder={userType === "student" ? "Student ID" : "Email"}
//             value={formData.username}
//             onChange={(e) =>
//               setFormData({ ...formData, username: e.target.value })
//             }
//             className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={(e) =>
//               setFormData({ ...formData, password: e.target.value })
//             }
//             className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//           />

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
//           >
//             Login
//           </button>
//         </form>

//         {/* Message */}
//         {message && (
//           <p className="mt-4 text-center text-sm text-red-500">{message}</p>
//         )}
//       </div>
//     </div>
//   );
// }




// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function LoginPage() {
//   const [userType, setUserType] = useState("student");
//   const [formData, setFormData] = useState({ username: "", password: "" });
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       // ✅ Decide API URL based on userType
//       let apiUrl = "";
//       if (userType === "student")
//         apiUrl = "http://localhost:5000/api/student/login";
//       else if (userType === "admin")
//         apiUrl = "http://localhost:5000/api/admin/login";
//       else if (userType === "registrar")
//         apiUrl = "http://localhost:5000/api/registrar/login";

//       // ✅ Prepare request body based on userType
//       const requestData =
//         userType === "student"
//           ? { studentId: formData.username, password: formData.password }
//           : { email: formData.username, password: formData.password };

//       const response = await axios.post(apiUrl, requestData);

//       if (response.data.success) {
//         // ✅ Store token and user info
//         localStorage.setItem("token", response.data.token);
//         localStorage.setItem("userType", response.data.userType);

//         const userData =
//           response.data.userType === "student"
//             ? response.data.student
//             : response.data.userType === "admin"
//             ? response.data.admin
//             : response.data.registrar; // 👈 handle registrar

//         localStorage.setItem("userData", JSON.stringify(userData));

//         // alert("Login successful");

//         // ✅ Redirect logic
//         if (response.data.isDefaultPassword === true) {
//           //the ff code used to store isDefault password condition on the browser localstorege to protect other pages from students access by checking it
//               localStorage.setItem(
//               "isDefaultPassword",
//               response.data.isDefaultPassword
//             );

//           navigate(`/${response.data.userType}/change-password`);
//         } else {
//           navigate(`/${response.data.userType}/dashboard`);
//         }
//       } else {
//         setMessage(response.data.message);
//       }
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Login failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
//       <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
//         <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
//           Department Placement System
//         </h1>

//         {/* User Type Toggle */}
//         <div className="flex justify-center mb-6">
//           <button
//             type="button"
//             onClick={() => setUserType("student")}
//             className={`px-4 py-2 border rounded-l-md ${
//               userType === "student"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-100 text-gray-700"
//             }`}
//           >
//             Student
//           </button>

//           <button
//             type="button"
//             onClick={() => setUserType("admin")}
//             className={`px-4 py-2 border ${
//               userType === "admin"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-100 text-gray-700"
//             }`}
//           >
//             Admin
//           </button>

//           <button
//             type="button"
//             onClick={() => setUserType("registrar")}
//             className={`px-4 py-2 border rounded-r-md ${
//               userType === "registrar"
//                 ? "bg-indigo-600 text-white"
//                 : "bg-gray-100 text-gray-700"
//             }`}
//           >
//             Registrar
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder={
//               userType === "student" ? "Student ID" : "Email"
//             }
//             value={formData.username}
//             onChange={(e) =>
//               setFormData({ ...formData, username: e.target.value })
//             }
//             className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={(e) =>
//               setFormData({ ...formData, password: e.target.value })
//             }
//             className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//           />

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
//           >
//             Login
//           </button>
//         </form>

//         {/* Message */}
//         {message && (
//           <p className="mt-4 text-center text-sm text-red-500">{message}</p>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (!response.data.success) {
        setMessage(response.data.message);
        return;
      }

      const { token, userType, user, isDefaultPassword } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userData", JSON.stringify(user));

      if (isDefaultPassword) {
        localStorage.setItem("isDefaultPassword", "true");
        navigate(`/${userType}/change-password`);
      } else {
        navigate(`/${userType}/dashboard`);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Department Placement System
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
