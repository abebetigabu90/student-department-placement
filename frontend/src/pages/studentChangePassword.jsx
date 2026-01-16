// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function ChangePasswordPage() {
//   const navigate = useNavigate();
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState("");

//   // ✅ Load student info from localStorage
//   const userData = JSON.parse(localStorage.getItem("userData"));
//   const studentId = userData?.studentId;

//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     if (newPassword !== confirmPassword) {
//       return setMessage("Passwords do not match");
//     }

//     try {
//       const response = await axios.post("http://localhost:5000/api/student/change-password", {
//         studentId,
//         newPassword,
//       });

//       if (response.data.success) {
//         alert("Password changed successfully!");
//         navigate("/student/dashboard");
//       } else {
//         setMessage(response.data.message);
//       }
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Failed to change password");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
//         <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
//           Change Your Password
//         </h2>

//         <form onSubmit={handleChangePassword} className="space-y-4">
//           <input
//             type="password"
//             placeholder="New Password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//           />

//           <input
//             type="password"
//             placeholder="Confirm New Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
//           />

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
//           >
//             Change Password
//           </button>
//         </form>

//         {message && (
//           <p className="mt-4 text-center text-sm text-red-500">{message}</p>
//         )}
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Message sent from RequirePasswordChange
  const changePasswordMessage = location.state?.message;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // Load student info
  const userData = JSON.parse(localStorage.getItem("userData"));
  const studentId = userData?.studentId;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setMessage("Passwords do not match");
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/student/change-password",
        {
          studentId,
          newPassword,
        }
      );

      if (response.data.success) {
        localStorage.setItem("isDefaultPassword", "false");
        navigate("/student/dashboard");
      } else {
        setMessage(response.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Change Your Password
        </h2>

        {changePasswordMessage && (
          <div className="mb-4 rounded-md bg-yellow-100 text-yellow-800 px-4 py-3 text-sm">
            {changePasswordMessage}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Change Password
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
