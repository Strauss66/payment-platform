import React from 'react';

export function Sheet({ open, onOpenChange, children }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  );
}

export function SheetContent({ side = 'right', className = '', children }){
  const sideClasses = side === 'right' ? 'right-0' : 'left-0';
  return (
    <div className={`absolute top-0 ${sideClasses} h-full w-full max-w-md bg-white shadow-xl p-4 animate-in slide-in-from-${side}-10 ${className}`}>
      {children}
    </div>
  );
}

export function SheetHeader({ children }){
  return <div className="mb-3">{children}</div>;
}

export function SheetTitle({ children }){
  return <div className="text-lg font-semibold">{children}</div>;
}

export function SheetDescription({ children }){
  return <div className="text-sm text-gray-500">{children}</div>;
}

export function SheetFooter({ children }){
  return <div className="mt-4 flex items-center justify-end gap-2">{children}</div>;
}

export default Sheet;

