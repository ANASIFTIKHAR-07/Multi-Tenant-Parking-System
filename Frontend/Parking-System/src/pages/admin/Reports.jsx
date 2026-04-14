import { useState, useRef } from 'react';
import { exportParkingRecordsCSV, exportTenantsCSV, exportBadgesCSV, exportRentalContractsCSV, importMasterData } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import Alert from '../../Components/common/Alert.jsx';

const FilterField = ({ field, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
      {field.label}
    </label>
    {field.type === 'select' ? (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[13px] text-slate-800 dark:text-slate-200 outline-none bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 dark:border-slate-700 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/5 transition-all"
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
        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none hover:border-slate-300 dark:hover:border-slate-600 dark:border-slate-700 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/5 transition-all"
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-white [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{title}</h3>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-4 flex-1">
        {filterFields && filterFields.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filters (optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <p className="text-[12px] text-slate-400 dark:text-slate-500 italic">No filters available for this export.</p>
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

// ── Result Summary Row ───────────────────────────────────────────────────────
const ResultRow = ({ label, count, icon }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
    <div className="flex items-center gap-2">
      <span className="text-slate-400 dark:text-slate-500 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </div>
    <span className={`text-[14px] font-bold ${count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
      {count}
    </span>
  </div>
);

export default function Reports() {
  const [error, setError] = useState('');
  const [parkingFilters, setParkingFilters]   = useState({});
  const [tenantFilters,  setTenantFilters]    = useState({});
  const [badgeFilters,   setBadgeFilters]     = useState({});
  const [contractFilters,setContractFilters]  = useState({});

  // ── Import State ──
  const fileRef = useRef(null);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setImportFile(file); setImportResult(null); setImportError(''); }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true); setImportError(''); setImportResult(null);
    try {
      const res = await importMasterData(importFile);
      setImportResult(res?.data || res?.message || res);
      setImportFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setImportError(e.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const doExport = async (urlFn, filters) => {
    setError('');
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      await urlFn(clean);
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
        title="Import & Reports"
        subtitle="Import master data or download filtered exports as CSV"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      />

      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}

      {/* ── Master Data Import Section ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-200">Master Data Import</h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">Upload your Excel workbook to populate the entire system automatically</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-[13px] text-amber-800 dark:text-amber-300 font-medium">
              This will scan your Excel sheets and create Units, Tenants, Employees, Badges, Parking Records, and Contracts. Duplicate records are automatically skipped.
            </p>
          </div>

          {/* File picker */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Excel File (.xlsx)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="w-full text-[13px] text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[12px] file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 file:cursor-pointer file:transition-colors"
              />
            </div>
            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {importing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Data
                </>
              )}
            </button>
          </div>

          {/* Import Error */}
          {importError && <Alert type="error" message={importError} onDismiss={() => setImportError('')} />}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Import Complete
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <ResultRow label="Units" count={importResult.units_processed || 0} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>} />
                <ResultRow label="Tenants" count={importResult.tenants_processed || 0} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <ResultRow label="Employees" count={importResult.employees_processed || 0} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                <ResultRow label="Badges" count={importResult.badges_processed || 0} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>} />
                <ResultRow label="Parking" count={importResult.parking_processed || 0} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} />
                <ResultRow label="Contracts" count={importResult.contracts_processed || 0} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-blue-500/10 border border-blue-100 dark:border-slate-800/20">
        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-[13px] text-blue-700 dark:text-blue-400 font-medium">
          All filters are optional. Leave them empty to export all records. Files open in a new tab and download automatically using your active session.
        </p>
      </div>

      {/* Export Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {CARDS.map(card => (
          <ExportCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
