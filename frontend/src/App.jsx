import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./index.css"; // Ensure this line is present
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;