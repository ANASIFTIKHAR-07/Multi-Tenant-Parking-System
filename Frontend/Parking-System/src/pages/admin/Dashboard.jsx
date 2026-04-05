import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTenants } from '../../services/adminApi.js';
import { fetchEmployees } from '../../services/adminApi.js';
import { fetchParkingRecords } from '../../services/adminApi.js';
import { fetchBadges } from '../../services/adminApi.js';
import { fetchRentalContracts } from '../../services/adminApi.js';
import { fetchVisitorCards } from '../../services/adminApi.js';
import StatCard from '../../Components/common/StatCard.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const QuickLink = ({ to, label, icon, color }) => (
  <Link to={to} className={`flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group`}>
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white w-5 h-5">{icon}</span>
    </div>
    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
    <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

export default function Dashboard() {
  const { admin } = useAuth();
  const [stats, setStats] = useState({});
  const [recentTenants, setRecentTenants] = useState([]);
  const [recentParking, setRecentParking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [tenants, employees, parking, badges, contracts, visitors] = await Promise.all([
          fetchTenants({ limit: 5 }),
          fetchEmployees({ limit: 1 }),
          fetchParkingRecords({ limit: 5, status: 'ACTIVE' }),
          fetchBadges({ limit: 1, status: 'ACTIVE' }),
          fetchRentalContracts({ limit: 1, status: 'ACTIVE' }),
          fetchVisitorCards({ limit: 1 }),
        ]);
        setStats({
          tenants: tenants?.data?.pagination?.total ?? 0,
          employees: employees?.data?.pagination?.total ?? 0,
          activeParkingRecords: parking?.data?.pagination?.total ?? 0,
          activeBadges: badges?.data?.pagination?.total ?? 0,
          activeContracts: contracts?.data?.pagination?.total ?? 0,
          visitorCards: visitors?.data?.pagination?.total ?? 0,
        });
        setRecentTenants(tenants?.data?.tenants ?? []);
        setRecentParking(parking?.data?.records ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative">
          <p className="text-blue-200 text-sm font-medium">{greeting},</p>
          <h1 className="text-2xl font-bold mt-0.5">{admin?.name || 'Admin'}</h1>
          <p className="text-blue-200 text-sm mt-1">Here's what's happening in your parking system today.</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Tenants" value={loading ? '...' : stats.tenants} color="blue"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard label="Employees" value={loading ? '...' : stats.employees} color="purple"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <StatCard label="Active Parking" value={loading ? '...' : stats.activeParkingRecords} color="green"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
        />
        <StatCard label="Active Badges" value={loading ? '...' : stats.activeBadges} color="indigo"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>}
        />
        <StatCard label="Contracts" value={loading ? '...' : stats.activeContracts} color="orange"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard label="Visitor Cards" value={loading ? '...' : stats.visitorCards} color="slate"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Tenants */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-800">Recent Tenants</h2>
            <Link to="/admin/tenants" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : recentTenants.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-12">No tenants yet</p>
            ) : recentTenants.map((t) => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{t.company_name?.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{t.company_name}</p>
                  <p className="text-xs text-slate-400 truncate">Floor {t.unit_id?.floor} · Unit {t.unit_id?.unit_number}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickLink to="/admin/tenants" label="Add Tenant" color="bg-blue-600"
              icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
            />
            <QuickLink to="/admin/employees" label="Add Employee" color="bg-purple-600"
              icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
            />
            <QuickLink to="/admin/parking" label="Assign Parking" color="bg-emerald-600"
              icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
            />
            <QuickLink to="/admin/badges" label="Issue Badge" color="bg-indigo-600"
              icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>}
            />
            <QuickLink to="/admin/visitor-cards" label="Issue Visitor Card" color="bg-orange-500"
              icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
            />
            <QuickLink to="/admin/reports" label="Export Reports" color="bg-slate-600"
              icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
          </div>
        </div>
      </div>

      {/* Recent Active Parking */}
      {recentParking.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-800">Active Parking Records</h2>
            <Link to="/admin/parking" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  {['Employee', 'Company', 'Car Plate', 'Type', 'Slot'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentParking.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{r.employee_id?.full_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{r.tenant_id?.company_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-slate-700">{r.car_plate_number}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.parking_type} /></td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{r.assigned_slot?.slot_code || '—'}</td>
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
