Design notes

Audit feed
- Implemented Option B: composition across `invoices`, `payments`, and `cash_sessions` using SQL UNION with tenant scoping.
- Response normalized to: `{ type, id, at, byUserId?, message, entityRef: { kind, id }, meta }`.
- Frontend `AdminOpsFeed` consumes `listAuditEvents` with graceful 404 fallback.

Late fee consolidation
- Unified policy in `backend/src/services/billing/lateFee.js` (computeLateFee).
- Added route `POST /api/billing/late-fees/run?asOf=YYYY-MM-DD` with idempotent guard per `school_id + year_month` recorded in `late_fee_runs`.
- Migration `2025091301-add-indexes-and-latefee-runs.cjs` creates ledger and key indexes for invoices/payments/cash_sessions.

List endpoints
- Invoices and payments list endpoints: tenant-scoped via `req.context.schoolId` (super admin header) or `req.user.school_id`.
- Validation via Zod with errors `{ code: "VALIDATION_ERROR", details: [...] }`.
- Standardized server errors: `{ code: 'INTERNAL_ERROR', message }`.

Frontend
- Extended `src/lib/api.billing.js` with sort normalization and helpers: `listRecentInvoices`, `listRecentPayments`, `listAuditEvents`.
- Admin dashboard widgets updated for loading/error/empty states and tenant short-circuit.


