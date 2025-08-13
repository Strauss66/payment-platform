import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function CoursesWidget(){
  return (
    <WidgetShell title="Courses" to="/app/courses">
      <div className="text-sm text-gray-500">No courses to show (mock)</div>
    </WidgetShell>
  );
}


