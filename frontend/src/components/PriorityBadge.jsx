import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

const priorityConfig = {
  'Critical': {
    bg: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
    label: 'Critical',
  },
  'High': {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: ArrowUp,
    label: 'High',
  },
  'Medium': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
    label: 'Medium',
  },
  'Low': {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: ArrowDown,
    label: 'Low',
  },
};

export default function PriorityBadge({ priority, size = 'md' }) {
  const config = priorityConfig[priority] || priorityConfig['Medium'];
  const Icon = config.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1 font-medium' 
    : 'text-xs font-semibold px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
