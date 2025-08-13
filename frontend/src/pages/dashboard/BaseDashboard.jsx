import React from 'react';
import QuickTile from '../../components/dashboard/QuickTile';
import WidgetShell from '../../components/dashboard/WidgetShell';
import WidgetGrid from '../../components/dashboard/WidgetGrid';
import RecommendationItem from '../../components/dashboard/RecommendationItem';

export default function BaseDashboard({ tiles = [], layout = [], renderWidget, recommendations = [] }){
  return (
    <div className="space-y-6">
      {/* Quick Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiles.map((t, idx) => (
          <QuickTile key={idx} title={t.title} imageUrl={t.imageUrl} onClick={t.onClick} />
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {recommendations.map((r, idx) => (
            <RecommendationItem key={idx} label={r.label} onClick={r.onClick} />
          ))}
        </div>
      )}

      {/* Widgets Header */}
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-strong)]">Widgets</div>
        <button className="text-sm text-[var(--primary)] hover:underline">Find New Widgets</button>
      </div>

      {/* Widgets Grid */}
      <WidgetGrid layout={layout} onLayoutChange={()=>{}} renderWidget={renderWidget} />
    </div>
  );
}


