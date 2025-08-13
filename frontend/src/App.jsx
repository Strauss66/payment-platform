import React from "react";
import AppRouter from "./app/AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import RoleAwareDashboardProvider from "./state/dashboard/RoleAwareDashboardProvider";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css"; // Ensure this line is present

function App() {
  return (
    <AuthProvider>
      <RoleAwareDashboardProvider defaultRole="student_parent">
        <div className="min-h-screen bg-gray-100">
          <AppRouter />
        </div>
      </RoleAwareDashboardProvider>
    </AuthProvider>
  );
}

export default App;