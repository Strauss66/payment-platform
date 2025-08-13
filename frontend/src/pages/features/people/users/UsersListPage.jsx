import React from "react";
import { useApi } from "../../../hooks/useApi";
import { Table, THead, TR, TD } from "../../../components/ui/Table";
import EmptyState from "../../../components/ui/EmptyState";
import Button from "../../../components/ui/Button";

export default function UsersListPage() {
  const { data, loading, error } = useApi("/api/admin/users");
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Failed to load users.</div>;

  const users = data?.users || [];
  if (!users.length) return <EmptyState title="No users yet" actionLabel="Invite User" onAction={()=>{}} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <Button onClick={()=>{ /* open invite modal */ }}>Invite</Button>
      </div>
      <Table head={<THead columns={[{label:"Name"}, {label:"Email"}, {label:"Roles"}]} />}>
        {users.map(u=>(
          <TR key={u.id}>
            <TD>{u.full_name || `${u.first_name} ${u.last_name}`}</TD>
            <TD>{u.email}</TD>
            <TD>{(u.roles||[]).join(", ")}</TD>
          </TR>
        ))}
      </Table>
    </div>
  );
}