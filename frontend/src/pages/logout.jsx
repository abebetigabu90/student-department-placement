import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Logging you out...");

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const res = await axios.post("http://localhost:5000/logout");

        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("role");   // match login keys
        localStorage.removeItem("userData");

        if (res.status === 200) {
          setStatus("Logged out successfully! Redirecting...");
        } else {
          setStatus("Logged out locally! Redirecting...");
        }

        setTimeout(() => navigate("/login"), 1500);
      } catch (error) {
        console.error("Error logging out:", error);

        // Always clear local storage anyway
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userData");

        setStatus("Logged out locally due to connection error! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg font-semibold">{status}</p>
    </div>
  );
};

export default Logout;
