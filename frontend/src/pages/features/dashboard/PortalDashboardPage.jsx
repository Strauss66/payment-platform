// src/features/dashboard/PortalDashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import WidgetGrid from "../../../components/dashboard/WidgetGrid";
import { fetchDashboardLayout, saveDashboardLayout } from "../../../lib/dashboard";
import StatementWidget from "../../../components/portal/StatementWidget.jsx";
import { api } from "../../../lib/apiClient";

const DEFAULT_LAYOUT = [
  { i: "heroLinks", x: 0, y: 0, w: 12, h: 7, minW: 6, minH: 5, label: "Quick Links" },
  { i: "canvasCourses", x: 0, y: 7, w: 4, h: 6, minW: 3, minH: 4, label: "Canvas Courses", href: "/canvas" },
  { i: "classSchedule", x: 4, y: 7, w: 4, h: 6, minW: 3, minH: 4, label: "Class Schedule", href: "/app/schedule" },
  { i: "tasksWidget", x: 8, y: 7, w: 4, h: 6, minW: 3, minH: 4, label: "Tasks", href: "/app/tasks" },
  { i: "statement", x: 0, y: 13, w: 12, h: 8, minW: 6, minH: 6, label: "Statement", href: "/app/portal" },
  { i: "gettingStarted", x: 0, y: 21, w: 12, h: 5, minW: 6, minH: 4, label: "Getting Started", href: "/app" }
];

export default function PortalDashboardPage(){
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myStudents, setMyStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await fetchDashboardLayout('portal');
        if (Array.isArray(saved) && saved.length > 0) setLayout(saved);
        // Load visible students for current user (self or children)
        try {
          const { data } = await api.get('/api/portal/my-students');
          setMyStudents(data || []);
          if (data && data.length > 0) setSelectedStudentId(data[0].id);
        } catch {}
      } catch {
        // ignore: first time users will have no layout
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveDashboardLayout('portal', layout);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setLayout(DEFAULT_LAYOUT);

  const renderWidget = (key) => {
    switch (key) {
      case 'canvasCourses':
        return <CanvasCoursesWidget />;
      case 'classSchedule':
        return <ClassScheduleWidget />;
      case 'tasksWidget':
        return <TasksWidget />;
      case 'statement':
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Financial Statement</div>
              <StudentSelector students={myStudents} value={selectedStudentId} onChange={setSelectedStudentId} />
            </div>
            {selectedStudentId ? <StatementWidget studentId={selectedStudentId} /> : <div className="text-gray-500 text-sm">No student linked.</div>}
          </div>
        );
      case 'currentBalance':
        return (
          <div>
            <div className="text-sm text-gray-500 mb-1">Outstanding</div>
            <div className="text-3xl font-semibold text-green-600">$0.00</div>
            <div className="text-xs text-gray-400 mt-1">No outstanding balance</div>
          </div>
        );
      case 'recentInvoices':
        return (
          <div>
            <div className="text-sm text-gray-500 mb-1">Invoices (last 30d)</div>
            <div className="text-3xl font-semibold text-blue-600">0</div>
            <div className="text-xs text-gray-400 mt-1">No recent invoices</div>
          </div>
        );
      case 'recentPayments':
        return (
          <div>
            <div className="text-sm text-gray-500 mb-1">Payments (last 30d)</div>
            <div className="text-3xl font-semibold text-emerald-600">0</div>
            <div className="text-xs text-gray-400 mt-1">No recent payments</div>
          </div>
        );
      case 'gettingStarted':
      default:
        return (
          <div className="text-gray-600">
            This dashboard will show your school information, invoices, payments, and other important details. Drag and resize widgets, then click Save.
          </div>
        );
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Portal Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">Reset</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <WidgetGrid
        layout={layout}
        onLayoutChange={setLayout}
        renderWidget={renderWidget}
      />
    </div>
  );
}

function StudentSelector({ students, value, onChange }){
  const list = Array.isArray(students) ? students : [];
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value) || null)}
      className="border rounded px-2 py-1 text-sm"
    >
      {list.length === 0 && <option value="">No students</option>}
      {list.map(s => (
        <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
      ))}
    </select>
  );
}

function HeroCard({ title, to, bg }){
  return (
    <a href={to} className="relative rounded-xl overflow-hidden shadow group block h-40">
      <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative h-full w-full grid place-items-center">
        <div className="text-white text-2xl font-bold drop-shadow">{title}</div>
      </div>
    </a>
  );
}

function CanvasCoursesWidget(){
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">Canvas Courses</div>
      <div className="text-xs text-gray-400">No active courses found</div>
    </div>
  );
}

function ClassScheduleWidget(){
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">Class Schedule</div>
      <div className="text-xs text-gray-400">No classes scheduled</div>
    </div>
  );
}

function TasksWidget(){
  return (
    <div>
      <div className="text-sm text-gray-500 mb-2">Tasks</div>
      <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
        <li><a href="/app/billing/payments" className="text-blue-600 hover:underline">Pay outstanding balance</a></li>
        <li><a href="/app/courses" className="text-blue-600 hover:underline">Review registration</a></li>
        <li><a href="/app/announcements" className="text-blue-600 hover:underline">Check announcements</a></li>
      </ul>
    </div>
  );
}