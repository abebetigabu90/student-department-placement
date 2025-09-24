// src/pages/Unauthorized.jsx
import React from "react";

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold">403 - Unauthorized</h1>
      <p className="mt-2">You don’t have permission to access this page.</p>
    </div>
  );
};

export default Unauthorized;
