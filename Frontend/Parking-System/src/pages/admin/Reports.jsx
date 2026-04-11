import React, { useState } from 'react';
import { exportParkingRecordsCSV, exportTenantsCSV, exportBadgesCSV, exportRentalContractsCSV } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import Alert from '../../Components/common/Alert.jsx';

const FilterField = ({ field, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
      {field.label}
    </label>
    {field.type === 'select' ? (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] text-slate-800 outline-none bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
      >
        <option value="">All</option>
        {field.options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={field.type || 'text'}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder-slate-400 outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
      />
    )}
  </div>
);

const ExportCard = ({ title, description, icon, color, onExport, filters, setFilters, filterFields }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try { await onExport(); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm flex flex-col overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-slate-800 leading-tight">{title}</h3>
          <p className="text-[12px] text-slate-400 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-4 flex-1">
        {filterFields && filterFields.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filters (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              {filterFields.map(f => (
                <FilterField
                  key={f.key}
                  field={f}
                  value={filters[f.key]}
                  onChange={val => setFilters(prev => ({ ...prev, [f.key]: val }))}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-slate-400 italic">No filters available for this export.</p>
        )}
      </div>

      {/* Export button — always pinned to bottom */}
      <div className="px-5 pb-5">
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-xl transition-colors shadow-sm"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default function Reports() {
  const [error, setError] = useState('');
  const [parkingFilters, setParkingFilters]   = useState({});
  const [tenantFilters,  setTenantFilters]    = useState({});
  const [badgeFilters,   setBadgeFilters]     = useState({});
  const [contractFilters,setContractFilters]  = useState({});

  const doExport = async (urlFn, filters) => {
    setError('');
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const url = urlFn(clean);
      window.open(url, '_blank');
    } catch (e) {
      setError(e.message || 'Export failed');
    }
  };

  const CARDS = [
    {
      title: 'Parking Records',
      description: 'All parking assignments with employee and vehicle details',
      color: 'bg-blue-600',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
      filters: parkingFilters,
      setFilters: setParkingFilters,
      onExport: () => doExport(exportParkingRecordsCSV, parkingFilters),
      filterFields: [
        { key: 'parking_type', label: 'Parking Type', type: 'select', options: [{ value: 'ASSIGNED', label: 'Assigned' }, { value: 'POOL', label: 'Pool' }, { value: 'RENTAL', label: 'Rental' }] },
        { key: 'status',       label: 'Status',       type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'CANCELLED', label: 'Cancelled' }] },
        { key: 'floor',        label: 'Floor',        placeholder: 'e.g. 1, 2' },
      ],
    },
    {
      title: 'Tenants',
      description: 'Tenant data with unit details and parking quotas',
      color: 'bg-violet-600',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      filters: tenantFilters,
      setFilters: setTenantFilters,
      onExport: () => doExport(exportTenantsCSV, tenantFilters),
      filterFields: [
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'TERMINATED', label: 'Terminated' }] },
        { key: 'floor',  label: 'Floor',  placeholder: 'e.g. 1, 2' },
      ],
    },
    {
      title: 'Access Badges',
      description: 'Badge issuance history with employee and deactivation details',
      color: 'bg-indigo-600',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>,
      filters: badgeFilters,
      setFilters: setBadgeFilters,
      onExport: () => doExport(exportBadgesCSV, badgeFilters),
      filterFields: [
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'CANCELLED', label: 'Cancelled' }, { value: 'LOST', label: 'Lost' }] },
        { key: 'tenant_id', label: 'Tenant ID', placeholder: 'Paste tenant ID' },
      ],
    },
    {
      title: 'Rental Contracts',
      description: 'Rental contract data with slot usage and expiry details',
      color: 'bg-emerald-600',
      icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      filters: contractFilters,
      setFilters: setContractFilters,
      onExport: () => doExport(exportRentalContractsCSV, contractFilters),
      filterFields: [
        { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'EXPIRED', label: 'Expired' }, { value: 'NEAR_EXPIRED', label: 'Near Expired' }, { value: 'CANCELLED', label: 'Cancelled' }] },
        { key: 'floor',  label: 'Floor',  placeholder: 'e.g. 1, 2' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export & Reports"
        subtitle="Download filtered data exports as CSV files"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />

      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-blue-50 border border-blue-100">
        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-[13px] text-blue-700 font-medium">
          All filters are optional. Leave them empty to export all records. Files open in a new tab and download automatically using your active session.
        </p>
      </div>

      {/* Cards grid — equal height via items-stretch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {CARDS.map(card => (
          <ExportCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
