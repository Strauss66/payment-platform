import { Wallet, CreditCard, Repeat, Banknote, MousePointer2 } from 'lucide-react';

export const methodIconMap: Record<string, any> = {
  cash: Wallet,
  pos: CreditCard,
  card: CreditCard,
  transfer: Repeat,
  wire: Banknote,
  online: MousePointer2,
};

export function getMethodIcon(method?: string){
  if (!method) return null;
  const key = String(method).toLowerCase();
  return methodIconMap[key] || null;
}

export function statusToTone(status?: string): 'success'|'warning'|'danger'|'neutral'{
  const key = String(status || '').toLowerCase();
  if (key === 'paid') return 'success';
  if (key === 'pending') return 'warning';
  if (key === 'overdue') return 'danger';
  return 'neutral';
}


