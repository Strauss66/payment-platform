// src/features/people/roles/RolesPage.jsx
import React from "react";
import { useApi } from "../../../hooks/useApi";
import { Table, THead, TR, TD } from "../../../components/ui/Table";

export default function RolesPage(){
  const { data, loading, error } = useApi("/api/admin/roles");
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Failed to load roles.</div>;

  const rows = data?.roles || [];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Roles</h1>
      <Table head={<THead columns={[{label:"Key"}, {label:"Display Name"}]} />}>
        {rows.map(r=>(
          <TR key={r.id}><TD>{r.key_name}</TD><TD>{r.display_name}</TD></TR>
        ))}
      </Table>
    </div>
  );
}