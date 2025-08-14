import React from "react";
import AppRouter from "./app/AppRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { TenantProvider } from "./contexts/TenantContext";
import BrandingProvider from "./components/BrandingProvider";
import RoleAwareDashboardProvider from "./state/dashboard/RoleAwareDashboardProvider";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css"; // Ensure this line is present

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <BrandingProvider>
          <RoleAwareDashboardProvider defaultRole="student_parent">
            <div className="min-h-screen bg-gray-100">
              <AppRouter />
            </div>
          </RoleAwareDashboardProvider>
        </BrandingProvider>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;