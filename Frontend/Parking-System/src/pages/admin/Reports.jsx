import React, { useState } from 'react';
import { exportParkingRecordsCSV, exportTenantsCSV, exportBadgesCSV, exportRentalContractsCSV } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import Alert from '../../Components/common/Alert.jsx';

const ExportCard = ({ title, description, icon, color, onExport, filters, setFilters, filterFields }) => {
  const [loading, setLoading] = useState(false);
  const handleExport = async () => {
    setLoading(true);
    try { await onExport(); }
    finally { setLoading(false); }
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-white w-6 h-6">{icon}</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      {filterFields && (
        <div className="grid grid-cols-2 gap-3">
          {filterFields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
              {f.type === 'select' ? (
                <select value={filters[f.key] || ''} onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
                  <option value="">All</option>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} value={filters[f.key] || ''} onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={handleExport} disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        Export CSV
      </button>
    </div>
  );
};

export default function Reports() {
  const [error, setError] = useState('');
  const [parkingFilters, setParkingFilters] = useState({});
  const [tenantFilters, setTenantFilters] = useState({});
  const [badgeFilters, setBadgeFilters] = useState({});
  const [contractFilters, setContractFilters] = useState({});

  const doExport = async (exportFn, filters) => {
    setError('');
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      await exportFn(clean);
    } catch (e) {
      setError(e.message || 'Export failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Export & Reports"
        subtitle="Download data exports in CSV format"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />

      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 flex items-start gap-4">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800">CSV Export</p>
          <p className="text-sm text-blue-600 mt-0.5">Apply optional filters before exporting. The file downloads in your browser using your current session (cookies). If your session expired, we refresh it once before exporting.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExportCard
          title="Parking Records"
          description="Export all parking assignments with employee and vehicle details"
          color="bg-blue-600"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
          filters={parkingFilters}
          setFilters={setParkingFilters}
          onExport={() => doExport(exportParkingRecordsCSV, parkingFilters)}
          filterFields={[
            { key: 'parking_type', label: 'Parking Type', type: 'select', options: [{ value: 'ASSIGNED', label: 'Assigned' }, { value: 'POOL', label: 'Pool' }, { value: 'RENTAL', label: 'Rental' }] },
            { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'CANCELLED', label: 'Cancelled' }] },
            { key: 'floor', label: 'Floor', placeholder: 'e.g. 1, 2' },
          ]}
        />
        <ExportCard
          title="Tenants"
          description="Export tenant data with unit details and parking quotas"
          color="bg-purple-600"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          filters={tenantFilters}
          setFilters={setTenantFilters}
          onExport={() => doExport(exportTenantsCSV, tenantFilters)}
          filterFields={[
            { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'TERMINATED', label: 'Terminated' }] },
            { key: 'floor', label: 'Floor', placeholder: 'e.g. 1, 2' },
          ]}
        />
        <ExportCard
          title="Access Badges"
          description="Export badge issuance history with employee and deactivation details"
          color="bg-indigo-600"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>}
          filters={badgeFilters}
          setFilters={setBadgeFilters}
          onExport={() => doExport(exportBadgesCSV, badgeFilters)}
          filterFields={[
            { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'CANCELLED', label: 'Cancelled' }, { value: 'LOST', label: 'Lost' }] },
          ]}
        />
        <ExportCard
          title="Rental Contracts"
          description="Export rental contract data with slot usage and expiry details"
          color="bg-emerald-600"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          filters={contractFilters}
          setFilters={setContractFilters}
          onExport={() => doExport(exportRentalContractsCSV, contractFilters)}
          filterFields={[
            { key: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'EXPIRED', label: 'Expired' }, { value: 'NEAR_EXPIRED', label: 'Near Expired' }, { value: 'CANCELLED', label: 'Cancelled' }] },
            { key: 'floor', label: 'Floor', placeholder: 'e.g. 1, 2' },
          ]}
        />
      </div>
    </div>
  );
}
