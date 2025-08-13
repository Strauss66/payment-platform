import React from 'react';
import WidgetShell from './WidgetShell';


export default function WidgetGrid({ layout, onLayoutChange, renderWidget }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {layout.map((item) => (
        <WidgetShell key={item.i} title={item.label || item.i}>
          {renderWidget(item.i)}
        </WidgetShell>
      ))}
    </div>
  );
}


