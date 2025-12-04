import React from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import FeatureStub from '../../components/ui/FeatureStub.jsx';

export default function EmployeesPage(){
  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <FeatureStub title="Employees" description="This feature is not available yet." />
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}
