import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTenants, fetchEmployees, fetchParkingRecords, fetchBadges, fetchRentalContracts, fetchVisitorCards } from '../../services/adminApi.js';
import StatCard from '../../Components/common/StatCard.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const QUICK_ACTIONS = [
  { to: '/admin/tenants',          label: 'Add Tenant',         color: 'bg-blue-600',   icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { to: '/admin/employees',        label: 'Add Employee',       color: 'bg-violet-600', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> },
  { to: '/admin/parking',          label: 'Assign Parking',     color: 'bg-emerald-600',icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
  { to: '/admin/badges',           label: 'Issue Badge',        color: 'bg-indigo-600', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg> },
  { to: '/admin/visitor-cards',    label: 'Visitor Card',       color: 'bg-orange-500', icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
  { to: '/admin/reports',          label: 'Export CSV',         color: 'bg-slate-700',  icon: <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

export default function Dashboard() {
  const { admin } = useAuth();
  const [stats, setStats] = useState({});
  const [recentTenants, setRecentTenants] = useState([]);
  const [recentParking, setRecentParking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetchTenants({ limit: 6 }),
      fetchEmployees({ limit: 1 }),
      fetchParkingRecords({ limit: 5, status: 'ACTIVE' }),
      fetchBadges({ limit: 1, status: 'ACTIVE' }),
      fetchRentalContracts({ limit: 1, status: 'ACTIVE' }),
      fetchVisitorCards({ limit: 1 }),
    ]).then((results) => {
      if (cancelled) return;
      const [tenants, employees, parking, badges, contracts, visitors] = results.map(
        r => r.status === 'fulfilled' ? r.value : null
      );
      setStats({
        tenants:              tenants?.data?.pagination?.total  ?? 0,
        employees:            employees?.data?.pagination?.total ?? 0,
        activeParkingRecords: parking?.data?.pagination?.total  ?? 0,
        activeBadges:         badges?.data?.pagination?.total   ?? 0,
        activeContracts:      contracts?.data?.pagination?.total ?? 0,
        visitorCards:         visitors?.data?.pagination?.total  ?? 0,
      });
      setRecentTenants(tenants?.data?.tenants  ?? []);
      setRecentParking(parking?.data?.records  ?? []);
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-5 sm:p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="relative">
          <p className="text-blue-200 text-[12px] font-medium">{greeting},</p>
          <h2 className="text-[20px] sm:text-[22px] font-bold mt-0.5 leading-tight">{admin?.name || 'Admin'}</h2>
          <p className="text-blue-200 text-[13px] mt-1 max-w-sm">Here's an overview of your parking system.</p>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.07] hidden sm:block">
          <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Tenants"        value={loading ? '…' : stats.tenants}              color="blue"   icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
        <StatCard label="Employees"      value={loading ? '…' : stats.employees}            color="purple" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
        <StatCard label="Active Parking" value={loading ? '…' : stats.activeParkingRecords} color="green"  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} />
        <StatCard label="Active Badges"  value={loading ? '…' : stats.activeBadges}         color="indigo" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>} />
        <StatCard label="Contracts"      value={loading ? '…' : stats.activeContracts}      color="orange" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
        <StatCard label="Visitor Cards"  value={loading ? '…' : stats.visitorCards}         color="teal"   icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent tenants */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">Recent Tenants</p>
            <Link to="/admin/tenants" className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:text-blue-400 transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-100 dark:border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : recentTenants.length === 0 ? (
            <p className="text-center text-[13px] text-slate-400 dark:text-slate-500 py-12">No tenants yet</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTenants.map(t => (
                <div key={t._id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 dark:bg-slate-800/60 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-[11px] font-bold">{t.company_name?.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{t.company_name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Floor {t.unit_id?.floor} · Unit {t.unit_id?.unit_number}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 shadow-sm p-5">
          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mb-4">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
            {QUICK_ACTIONS.map(a => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:border-slate-700/80 hover:bg-slate-50/60 dark:bg-slate-800/60 transition-all group"
              >
                <div className={`w-7 h-7 rounded-lg ${a.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white [&>svg]:w-3.5 [&>svg]:h-3.5">{a.icon}</span>
                </div>
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:text-slate-200 transition-colors truncate">{a.label}</span>
                <svg className="w-3.5 h-3.5 text-slate-300 ml-auto flex-shrink-0 group-hover:text-slate-400 dark:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Active parking table */}
      {recentParking.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">Active Parking Records</p>
            <Link to="/admin/parking" className="text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:text-blue-400 transition-colors">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
                  {['Employee', 'Company', 'Plate', 'Type', 'Slot'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentParking.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/60 dark:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{r.employee_id?.full_name || '—'}</td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{r.tenant_id?.company_name || '—'}</td>
                    <td className="px-5 py-3.5 text-[13px] font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.car_plate_number}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={r.parking_type} /></td>
                    <td className="px-5 py-3.5 text-[12px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{r.assigned_slot?.slot_code || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
