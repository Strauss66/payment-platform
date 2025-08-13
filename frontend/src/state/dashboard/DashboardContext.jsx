import React, { createContext, useContext, useMemo } from 'react';
import CoursesWidget from '../../pages/dashboard/widgets/CoursesWidget';
import ClassScheduleWidget from '../../pages/dashboard/widgets/ClassScheduleWidget';
import TasksWidget from '../../pages/dashboard/widgets/TasksWidget';
import GradeReportWidget from '../../pages/dashboard/widgets/GradeReportWidget';
import CampusEventsWidget from '../../pages/dashboard/widgets/CampusEventsWidget';
import BalancesWidget from '../../pages/dashboard/widgets/BalancesWidget';
import HoldsWidget from '../../pages/dashboard/widgets/HoldsWidget';
import EmailFilesWidget from '../../pages/dashboard/widgets/EmailFilesWidget';
import AcademicProfileWidget from '../../pages/dashboard/widgets/AcademicProfileWidget';
import AcademicDeadlinesWidget from '../../pages/dashboard/widgets/AcademicDeadlinesWidget';
// Admin widgets
import KPIsWidget from '../../pages/Admin/widgets/KPIsWidget';
import CollectionsWidget from '../../pages/Admin/widgets/CollectionsWidget';
import ApprovalsQueueWidget from '../../pages/Admin/widgets/ApprovalsQueueWidget';
import ExperimentsWidget from '../../pages/Admin/widgets/ExperimentsWidget';
import SystemHealthWidget from '../../pages/Admin/widgets/SystemHealthWidget';
import AuditLogWidget from '../../pages/Admin/widgets/AuditLogWidget';

const DashboardContext = createContext(null);

export function getWidgetsForRole(role){
  if (role === 'admin') {
    // Admin ordered widgets per acceptance
    return [
      { key: 'kpis', component: KPIsWidget, w: 12, h: 4 },
      { key: 'collections', component: CollectionsWidget, w: 12, h: 8 },
      { key: 'approvals', component: ApprovalsQueueWidget, w: 6, h: 8 },
      { key: 'experiments', component: ExperimentsWidget, w: 6, h: 8 },
      { key: 'systemHealth', component: SystemHealthWidget, w: 12, h: 6 },
      { key: 'auditLog', component: AuditLogWidget, w: 12, h: 8 },
    ];
  }
  // Static BYUI-like defaults, ordered
  const defaultWidgets = [
    { key: 'courses', label: 'Courses', component: CoursesWidget },
    { key: 'classSchedule', label: 'Class Schedule', component: ClassScheduleWidget },
    { key: 'tasks', label: 'Tasks', component: TasksWidget },
    { key: 'gradeReport', label: 'Grade Report', component: GradeReportWidget },
    { key: 'campusEvents', label: 'Campus Events', component: CampusEventsWidget },
    { key: 'balances', label: 'Balances', component: BalancesWidget },
    { key: 'holds', label: 'Holds', component: HoldsWidget },
    { key: 'emailFiles', label: 'Email & Files', component: EmailFilesWidget },
    { key: 'academicProfile', label: 'Academic Profile', component: AcademicProfileWidget },
    { key: 'academicDeadlines', label: 'Academic Deadlines', component: AcademicDeadlinesWidget }
  ];
  return defaultWidgets;
}

export function DashboardProvider({ role = 'student_parent', children }){
  const widgets = useMemo(() => getWidgetsForRole(role), [role]);
  const layout = widgets.map((w) => ({ i: w.key, label: w.label }));

  const value = {
    role,
    widgets,
    layout,
    fetchers: {}
  };

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard(){
  return useContext(DashboardContext);
}


