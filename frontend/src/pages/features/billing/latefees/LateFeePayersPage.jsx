// src/features/billing/latefees/LateFeePayersPage.jsx
import React from "react";
import { useApi } from "../../../../hooks/useApi";
import { Table, THead, TR, TD } from "../../../../components/ui/Table";
import { fmtMoney } from "../../../../lib/formatters";

export default function LateFeePayersPage(){
  const { data, loading, error } = useApi("/api/billing/late-fees/payers"); // backend should return {rows:[{family, student, invoice_number, late_fee}]}
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Failed to load late fee list.</div>;
  const rows = data?.rows || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Late Fee Payers</h1>
      <Table head={<THead columns={[{label:"Invoice #"}, {label:"Student"}, {label:"Family"}, {label:"Late Fee", right:true}]} />}>
        {rows.map((x)=>(
          <TR key={x.invoice_id}>
            <TD>{x.invoice_number}</TD>
            <TD>{x.student}</TD>
            <TD>{x.family}</TD>
            <TD right>{fmtMoney(x.late_fee)}</TD>
          </TR>
        ))}
      </Table>
    </div>
  );
}