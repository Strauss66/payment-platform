import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';

export default function ReportsPage(){
  const navigate = useNavigate();
  function go(path){ return () => navigate(path); }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Billing Reports</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card title="Aging Detail" description="Open invoices grouped by bucket" onClick={go('/app/billing/invoices?status=open')} />
            <Card title="Collections by Method" description="Payments grouped by method" onClick={go(`/app/billing/payments`)} />
            <Card title="Top Debtors" description="Families/students with high balances" onClick={go('/app/admin/dashboard')} />
            <Card title="Daily Payments" description="List of payments for a single day" onClick={go(`/app/billing/payments?from=${new Date().toISOString().slice(0,10)}&to=${new Date().toISOString().slice(0,10)}`)} />
          </div>
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}

function Card({ title, description, onClick }){
  return (
    <button onClick={onClick} className="p-4 rounded border bg-white text-left hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-200">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </button>
  );
}


