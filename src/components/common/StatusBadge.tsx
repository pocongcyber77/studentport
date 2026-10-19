import React from 'react';
import { CompetencyStatus } from '../../types';
import { CheckCircle2, TrendingUp, CircleDashed } from 'lucide-react';

interface StatusBadgeProps {
  status: CompetencyStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = {
    ACHIEVED: {
      label: 'Tercapai',
      sublabel: 'Ambang batas terpenuhi',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
    },
    DEVELOPING: {
      label: 'Sedang Berkembang',
      sublabel: 'Perlu penguatan konsep',
      bg: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
      icon: TrendingUp,
      dotColor: 'bg-amber-500',
    },
    NOT_STARTED: {
      label: 'Belum Dimulai',
      sublabel: 'Belum ada asesmen',
      bg: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/20',
      icon: CircleDashed,
      dotColor: 'bg-slate-400',
    },
  }[status] || {
    label: 'Belum Dimulai',
    sublabel: 'Belum ada asesmen',
    bg: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-400/20',
    icon: CircleDashed,
    dotColor: 'bg-slate-400',
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm md:text-base px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 18,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs transition-colors ${config.bg} ${sizeClasses} ${className}`}
      title={`${config.label} — ${config.sublabel}`}
    >
      {showIcon && <IconComponent size={iconSizes} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
