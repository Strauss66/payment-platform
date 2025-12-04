import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card.jsx';
import StatCard from '../../components/ui/StatCard.tsx';
import Pill from '../../components/ui/Pill.tsx';
import DataTable from '../../components/ui/DataTable.tsx';
import { api } from '../../lib/apiClient';

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function PaymentDetailPage(){
  const { invoiceId } = useParams();
  const [state, setState] = useState('idle');
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!invoiceId) return;
    (async () => {
      setState('loading');
      try {
        // Best-effort API calls; fallback gracefully if missing
        const invResp = await api.get(`/api/billing/invoices/${encodeURIComponent(invoiceId)}`).catch(() => ({ data: null }));
        setInvoice(invResp?.data || null);
        const payResp = await api.get('/api/billing/payments', { params: { invoice_id: invoiceId, limit: 50, sort: 'paid_at:desc' } }).catch(() => ({ data: { rows: [] }}));
        setPayments(Array.isArray(payResp?.data?.rows) ? payResp.data.rows : []);
        const evResp = await api.get('/api/audit/events', { params: { subject_type: 'invoice', subject_id: invoiceId, limit: 100 } }).catch(() => ({ data: { events: [] }}));
        setEvents(Array.isArray(evResp?.data?.events) ? evResp.data.events : []);
        setState('idle');
      } catch {
        setState('error');
      }
    })();
  }, [invoiceId]);

  const historyRows = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.map((e, i) => ({
      id: i,
      type: e.type || e.event || 'event',
      at: e.created_at || e.at || e.timestamp,
      note: e.note || e.message || '',
      amount: e.amount
    }));
  }, [events]);

  const historyCols = useMemo(() => [
    { key: 'type', header: 'Event' },
    { key: 'at', header: 'When', render: (r) => r.at ? new Date(r.at).toLocaleString() : '-' },
    { key: 'note', header: 'Details' },
    { key: 'amount', header: 'Amount', render: (r) => r.amount ? mxn.format(Number(r.amount)) : '', className: 'text-right' },
  ], []);

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.CASHIER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">Payment Detail</div>
              <div className="text-sm text-slate-600">
                {invoice?.student_name ? (
                  <>
                    <span className="font-medium text-slate-800">{invoice.student_name}</span>
                    {invoice.student_grade ? <span className="ml-2 text-slate-500">Grade {invoice.student_grade}</span> : null}
                    {invoice.student_group ? <span className="ml-2 text-slate-500">Group {invoice.student_group}</span> : null}
                    {invoice.student_id ? <span className="ml-2 text-slate-500">ID {invoice.student_id}</span> : null}
                  </>
                ) : 'Invoice '}{invoice?.invoice_no || `#${invoiceId}`}
              </div>
            </div>
            <div className="flex gap-3">
              <Pill tone={invoice?.status === 'paid' ? 'success' : invoice?.status === 'overdue' ? 'danger' : 'default'}>
                {String(invoice?.status || 'unknown').toUpperCase()}
              </Pill>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b">
            {['overview','invoices','history','documents'].map((k)=>(
              <button key={k} className={`px-3 py-2 text-sm ${tab===k?'border-b-2 border-slate-900 font-medium':'text-slate-600'}`} onClick={()=>setTab(k)}>
                {k[0].toUpperCase()+k.slice(1)}
              </button>
            ))}
          </div>

          {state === 'loading' ? (
            <div className="h-24 rounded-2xl border bg-white animate-pulse" />
          ) : state === 'error' ? (
            <div className="p-3 rounded border border-rose-200 bg-rose-50 text-rose-700 text-sm">Failed to load details.</div>
          ) : (
            <>
              {tab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-4">
                    <Card>
                      <div className="text-sm text-slate-600 mb-1">Balance</div>
                      <div className="text-3xl font-semibold tracking-tight">{mxn.format(Number(invoice?.balance ?? 0))}</div>
                      <div className="mt-2 text-sm text-slate-600">
                        Past Due: {mxn.format(Number(invoice?.past_due ?? 0))} · Next Due: {mxn.format(Number(invoice?.next_due ?? 0))}
                      </div>
                    </Card>
                    <Card>
                      <div className="font-medium">Tuition Plan</div>
                      <div className="text-sm text-slate-600">{invoice?.tuition_plan || '—'}</div>
                    </Card>
                    <Card>
                      <div className="font-medium">Scholarships & Discounts</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {(invoice?.discounts || []).length ? (invoice.discounts.map((d, i)=>(
                          <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{d.name} {d.amount ? `(${mxn.format(Number(d.amount))})` : ''}</span>
                        ))) : <span className="text-slate-500">None</span>}
                      </div>
                    </Card>
                  </div>
                  <div className="lg:col-span-7">
                    <Card>
                      <div className="font-medium mb-3">Timeline</div>
                      <DataTable
                        columns={historyCols}
                        rows={historyRows}
                        emptyText="No events available"
                      />
                    </Card>
                  </div>
                </div>
              )}

              {tab === 'invoices' && (
                <Card>
                  <div className="font-medium mb-3">Invoices</div>
                  <DataTable
                    columns={[
                      { key: 'invoice_no', header: 'Invoice #' },
                      { key: 'status', header: 'Status', render: (r)=><Pill tone={r.status==='paid'?'success':r.status==='overdue'?'danger':'default'}>{String(r.status||'').toUpperCase()}</Pill> },
                      { key: 'due_date', header: 'Due Date', render: (r)=>r.due_date?new Date(r.due_date).toLocaleDateString():'-' },
                      { key: 'total', header: 'Total', render: (r)=>mxn.format(Number(r.total||0)), className: 'text-right' },
                    ]}
                    rows={invoice ? [invoice] : []}
                    emptyText="No invoice"
                  />
                </Card>
              )}

              {tab === 'history' && (
                <Card>
                  <div className="font-medium mb-3">Payments</div>
                  <DataTable
                    columns={[
                      { key: 'id', header: 'Payment #' },
                      { key: 'paid_at', header: 'Paid At', render: (r)=>r.paid_at?new Date(r.paid_at).toLocaleString():'-' },
                      { key: 'method', header: 'Method', render: (r)=>String(r.method||r.payment_method||'-') },
                      { key: 'amount', header: 'Amount', render: (r)=>mxn.format(Number(r.amount||0)), className: 'text-right' },
                      { key: 'cashier', header: 'Cashier', render: (r)=>r.cashier_name || r.cashier_user_id || '-' },
                    ]}
                    rows={payments}
                    emptyText="No payments"
                  />
                </Card>
              )}

              {tab === 'documents' && (
                <Card>
                  <div className="font-medium mb-2">Documents</div>
                  <div className="text-sm text-slate-600">CFDI previews and PDFs are accessible from the Invoices section.</div>
                </Card>
              )}
            </>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}
