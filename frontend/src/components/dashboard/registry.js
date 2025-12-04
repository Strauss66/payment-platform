import React from 'react';
import AdminRevenueKPIs from "./widgets/AdminRevenueKPIs.jsx";
import AdminAgingBuckets from "./widgets/AdminAgingBuckets.jsx";
import CashierTodayKPIs from "./widgets/CashierTodayKPIs.jsx";
import CashierPaymentsByMethod from "./widgets/CashierPaymentsByMethod.jsx";
import AttentionNeeded from "./widgets/AttentionNeeded.jsx";
import ParentSummary from "./widgets/ParentSummary.jsx";
import CashierSessionStatus from "./widgets/cashier/CashierSessionStatus.jsx";

const Placeholder = ({ title = "Widget" }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-gray-500">{title}</div>
);

export const WIDGETS = {
  todaysCollections: CashierTodayKPIs,
  pendingInvoices: AdminAgingBuckets,
  overdueInvoices: AdminAgingBuckets,
  activeDiscounts: (props) => <Placeholder title="Active Discounts" {...props} />,
  collectionsLineChart: AdminRevenueKPIs,
  paymentMethodMix: CashierPaymentsByMethod,
  attentionNeededTable: AttentionNeeded,
  cashierSessionStatus: CashierSessionStatus,
  parentSummary: ParentSummary,
  classesToday: (props) => <Placeholder title="Classes Today" {...props} />,
  assignmentsToGrade: (props) => <Placeholder title="Assignments to Grade" {...props} />,
  attendanceAlerts: (props) => <Placeholder title="Attendance Alerts" {...props} />,
  gradeProgressSpark: (props) => <Placeholder title="Grade Progress" {...props} />,
  upcomingEvents: (props) => <Placeholder title="Upcoming Events" {...props} />,
  recentAnnouncements: (props) => <Placeholder title="Recent Announcements" {...props} />,
};