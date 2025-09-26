import React from 'react';

type TimeRange = 'month' | 'all';

export default function TimeRangeToggle({ defaultValue = 'month', onChange }: { defaultValue?: TimeRange; onChange?: (v: TimeRange) => void }) {
  const [value, setValue] = React.useState<TimeRange>(defaultValue);
  const set = (v: TimeRange) => {
    setValue(v);
    onChange?.(v);
  };
  const base = 'px-4 py-2 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md active:scale-[.99]';
  return (
    <div className="inline-flex items-center gap-2 bg-transparent" role="tablist" aria-label="Time range">
      <button
        role="tab"
        aria-selected={value === 'month'}
        className={[base, value === 'month' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'].join(' ')}
        onClick={() => set('month')}
      >
        This Month
      </button>
      <button
        role="tab"
        aria-selected={value === 'all'}
        className={[base, value === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'].join(' ')}
        onClick={() => set('all')}
      >
        All Time
      </button>
    </div>
  );
}


