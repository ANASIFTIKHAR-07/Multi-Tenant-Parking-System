import React from 'react';

const STATUS_CONFIG = {
  // Tenant
  ACTIVE:       { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-600/20' },
  INACTIVE:     { bg: 'bg-slate-50',   text: 'text-slate-600',   dot: 'bg-slate-400',   ring: 'ring-slate-500/20' },
  TERMINATED:   { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     ring: 'ring-red-600/20' },
  // Badge
  CANCELLED:    { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-500',  ring: 'ring-orange-600/20' },
  LOST:         { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: 'bg-yellow-500',  ring: 'ring-yellow-600/20' },
  // Parking
  ASSIGNED:     { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',    ring: 'ring-blue-600/20' },
  POOL:         { bg: 'bg-purple-50',  text: 'text-purple-700',  dot: 'bg-purple-500',  ring: 'ring-purple-600/20' },
  RENTAL:       { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500',  ring: 'ring-indigo-600/20' },
  // Visitor
  AVAILABLE:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-600/20' },
  IN_USE:       { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500',    ring: 'ring-blue-600/20' },
  DEACTIVATED:  { bg: 'bg-slate-50',   text: 'text-slate-600',   dot: 'bg-slate-400',   ring: 'ring-slate-500/20' },
  // Contract
  EXPIRED:      { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',     ring: 'ring-red-600/20' },
  NEAR_EXPIRED: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500',   ring: 'ring-amber-600/20' },
};

export default function StatusBadge({ status, pulse = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
