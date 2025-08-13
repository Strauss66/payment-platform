import React, { useMemo } from "react";
import BaseDashboard from "../dashboard/BaseDashboard";
import { useDashboard } from "../../state/dashboard/DashboardContext";

export default function AdminDashboard() {
  const { widgets } = useDashboard();
  const layout = useMemo(
    () => widgets.map((w, i) => ({ i: w.key, x: (i % 3) * 4, y: Math.floor(i/3) * 6, w: w.w, h: w.h, minW: 3, minH: 4, label: '' })),
    [widgets]
  );

  const tiles = useMemo(() => ([
    { title: 'Admin Quick Links' },
    { title: 'Registration Links' },
    { title: 'Quick Help' }
  ]), []);

  const recommendations = useMemo(() => ([
    { label: 'Enable SSO' },
    { label: 'Configure Backup' },
    { label: 'Review DPA' },
    { label: 'Run Access Review' }
  ]), []);

  const renderWidget = (key) => {
    const found = widgets.find(w => w.key === key);
    if (!found) return null;
    const C = found.component;
    return <C />;
  };

  return (
    <BaseDashboard tiles={tiles} layout={layout} renderWidget={renderWidget} recommendations={recommendations} />
  );
}
