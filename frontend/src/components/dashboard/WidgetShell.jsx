import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

export default function WidgetShell({ title, action, children, to }){
  const navigate = useNavigate();
  const isClickable = Boolean(to);
  const handleClick = () => { if (to) navigate(to); };
  return (
    <div
      className={`bg-[var(--surface)] rounded-[var(--radius-card)] border border-[var(--surface-muted)] shadow-[var(--shadow-card)] overflow-hidden ${isClickable ? 'cursor-pointer hover:ring-1 hover:ring-[var(--primary)] hover:border-[var(--primary)]' : ''}`}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleClick(); } }}
    >
      <div className="px-4 py-2.5 border-b border-[var(--surface-muted)] bg-[color-mix(in_srgb,var(--surface-muted)_55%,transparent)] flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-strong)]">{title}</div>
        <div className="flex items-center gap-2">
          {action}
          <button aria-label="Widget menu" className="p-1.5 rounded hover:bg-[var(--surface-muted)]">
            <MoreHorizontal className="size-4 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}


