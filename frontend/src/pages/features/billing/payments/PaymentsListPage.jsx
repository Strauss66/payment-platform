// src/features/billing/payments/PaymentsListPage.jsx
import React from "react";
import { useApi } from "../../../hooks/useApi";
import { Table, THead, TR, TD } from "../../../components/ui/Table";
import { fmtMoney } from "../../../lib/formatters";
import Button from "../../../components/ui/Button";

export default function PaymentsListPage(){
  const { data, loading, error } = useApi("/api/payments");
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Failed to load payments.</div>;
  const rows = data?.payments || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payments</h1>
        <Button onClick={()=>{/* open take payment modal */}}>Take Payment</Button>
      </div>
      <Table head={<THead columns={[{label:"ID"}, {label:"Family/Student"}, {label:"Method"}, {label:"Amount", right:true}, {label:"Date"}]} />}>
        {rows.map(p=>(
          <TR key={p.id}>
            <TD>{p.id}</TD>
            <TD>{p.family_name || p.student_name}</TD>
            <TD>{p.method}</TD>
            <TD right>{fmtMoney(p.amount)}</TD>
            <TD>{new Date(p.received_at).toLocaleString()}</TD>
          </TR>
        ))}
      </Table>
    </div>
  );
}