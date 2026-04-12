import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee, addVehicle, removeVehicle, fetchTenants } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

const EMPTY_EMP = { tenant_id: '', full_name: '', id_card_number: '', job_title: '', status: 'ACTIVE', remarks: '' };
const EMPTY_VEH = { car_plate_number: '', sticker_number: '', car_tag: '', is_primary: false };

export default function Employees() {
  useDocumentTitle('Employees');
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tenant_id: '', status: '' });
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_EMP);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEH);
  const [submitting, setSubmitting] = useState(false);
  const [detailEmployee, setDetailEmployee] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, tenRes] = await Promise.all([
        fetchEmployees({ page, limit: 15, ...filters }),
        fetchTenants({ limit: 100, status: 'ACTIVE' }),
      ]);
      setEmployees(empRes?.data?.employees ?? []);
      setPagination(empRes?.data?.pagination ?? null);
      setTenants(tenRes?.data?.tenants ?? []);
    } catch (e) { toast.error('Error', e.message); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_EMP); setEditing(null); setFormError(''); setModal('form'); };
  const openEdit = (emp) => {
    setForm({ tenant_id: emp.tenant_id?._id || emp.tenant_id || '', full_name: emp.full_name, id_card_number: emp.id_card_number || '', job_title: emp.job_title || '', status: emp.status, remarks: emp.remarks || '' });
    setEditing(emp); setFormError(''); setModal('form');
  };
  const openDetail = (emp) => { setDetailEmployee(emp); setModal('detail'); };
  const openAddVehicle = (emp) => { setEditing(emp); setVehicleForm(EMPTY_VEH); setFormError(''); setModal('vehicle'); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const payload = { ...form, id_card_number: form.id_card_number || undefined, job_title: form.job_title || undefined, remarks: form.remarks || undefined };
      if (editing) { await updateEmployee(editing._id, payload); toast.success('Success', 'Employee updated.'); }
      else { await createEmployee(payload); toast.success('Success', 'Employee created.'); }
      setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const payload = { car_plate_number: vehicleForm.car_plate_number, sticker_number: vehicleForm.sticker_number || undefined, car_tag: vehicleForm.car_tag ? Number(vehicleForm.car_tag) : undefined, is_primary: vehicleForm.is_primary };
      await addVehicle(editing._id, payload);
      toast.success('Success', 'Vehicle added.'); setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleRemoveVehicle = async (empId, plate) => {
    if (!confirm(`Remove vehicle ${plate}?`)) return;
    try { await removeVehicle(empId, plate); toast.success('Success', 'Vehicle removed.'); load(); }
    catch (e) { toast.error('Error', e.message); }
  };

  const handleDelete = async (emp) => {
    if (!confirm(`Delete employee "${emp.full_name}"?`)) return;
    try { await deleteEmployee(emp._id); toast.success('Success', 'Employee deleted.'); load(); }
    catch (e) { toast.error('Error', e.message); }
  };

  const columns = useMemo(() => [
    { key: 'full_name', label: 'Employee', render: r => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{r.full_name?.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.full_name}</p>
          {r.id_card_number && <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{r.id_card_number}</p>}
        </div>
      </div>
    )},
    { key: 'tenant', label: 'Company', render: r => (
      <div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{r.tenant_id?.company_name || '—'}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Floor {r.tenant_id?.unit_id?.floor} · {r.tenant_id?.unit_id?.unit_number}</p>
      </div>
    )},
    { key: 'job_title', label: 'Job Title', render: r => r.job_title || <span className="text-slate-300">—</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'badge', label: 'Badge', render: r => r.active_badge ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold ring-1 ring-emerald-100">
        #{r.active_badge.badge_number}
      </span>
    ) : <span className="text-slate-300 text-xs">None</span> },
    { key: 'vehicles', label: 'Vehicles', render: r => (
      <span className="text-xs text-slate-500 dark:text-slate-400">{r.vehicles?.length || 0} registered</span>
    )},
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1.5 justify-end">
        <button onClick={() => openDetail(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors">View</button>
        <button onClick={() => openAddVehicle(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">+ Vehicle</button>
        <button onClick={() => openEdit(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">Edit</button>
        <button onClick={() => handleDelete(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">Delete</button>
      </div>
    )},
  ], []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Employees"
        subtitle="Manage employees and their registered vehicles"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Employee
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Company</label>
          <select value={filters.tenant_id} onChange={e => { setFilters(f => ({ ...f, tenant_id: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all bg-white dark:bg-slate-900">
            <option value="">All Companies</option>
            {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
          <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all bg-white dark:bg-slate-900">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <button onClick={() => { setFilters({ tenant_id: '', status: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Clear</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={employees} loading={loading} emptyMessage="No employees found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Employee Form Modal */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editing ? 'Edit Employee' : 'Add Employee'} size="large">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Full Name" required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" />
            <TextInput label="ID Card Number" value={form.id_card_number} onChange={e => setForm(f => ({ ...f, id_card_number: e.target.value }))} placeholder="ID-12345" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Job Title" value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} placeholder="Software Engineer" />
            <SelectInput label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectInput>
          </div>
          <SelectInput label="Company (Tenant)" required value={form.tenant_id} onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))}>
            <option value="">Select company</option>
            {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name}</option>)}
          </SelectInput>
          <TextareaInput label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal isOpen={modal === 'vehicle'} onClose={() => setModal(null)} title={`Add Vehicle — ${editing?.full_name}`}>
        <form onSubmit={handleAddVehicle} className="space-y-4">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <TextInput label="Car Plate Number" required value={vehicleForm.car_plate_number} onChange={e => setVehicleForm(f => ({ ...f, car_plate_number: e.target.value }))} placeholder="ABC-1234" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Sticker Number" value={vehicleForm.sticker_number} onChange={e => setVehicleForm(f => ({ ...f, sticker_number: e.target.value }))} placeholder="STK-001" />
            <TextInput label="Car Tag" type="number" value={vehicleForm.car_tag} onChange={e => setVehicleForm(f => ({ ...f, car_tag: e.target.value }))} placeholder="1234" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={vehicleForm.is_primary} onChange={e => setVehicleForm(f => ({ ...f, is_primary: e.target.checked }))} className="w-4 h-4 rounded text-slate-900 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as primary vehicle</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={modal === 'detail'} onClose={() => setModal(null)} title={detailEmployee?.full_name} size="large">
        {detailEmployee && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Company</p><p className="font-medium text-slate-800 dark:text-slate-200">{detailEmployee.tenant_id?.company_name}</p></div>
              <div><p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Job Title</p><p className="font-medium text-slate-800 dark:text-slate-200">{detailEmployee.job_title || '—'}</p></div>
              <div><p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">ID Card</p><p className="font-mono text-slate-800 dark:text-slate-200">{detailEmployee.id_card_number || '—'}</p></div>
              <div><p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1">Status</p><StatusBadge status={detailEmployee.status} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Registered Vehicles</p>
                <button onClick={() => { setModal(null); setTimeout(() => openAddVehicle(detailEmployee), 100); }} className="text-xs font-semibold text-slate-900 dark:text-blue-400 hover:text-blue-700 dark:text-blue-400">+ Add Vehicle</button>
              </div>
              {detailEmployee.vehicles?.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">No vehicles registered.</p>
              ) : (
                <div className="space-y-2">
                  {detailEmployee.vehicles?.map((v) => (
                    <div key={v.car_plate_number} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" /></svg>
                        <div>
                          <p className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-200">{v.car_plate_number}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{v.sticker_number ? `Sticker: ${v.sticker_number}` : ''}{v.car_tag ? ` · Tag: ${v.car_tag}` : ''}</p>
                        </div>
                        {v.is_primary && <span className="px-2 py-0.5 rounded-full bg-slate-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold ring-1 ring-blue-100">Primary</span>}
                      </div>
                      <button onClick={() => handleRemoveVehicle(detailEmployee._id, v.car_plate_number)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 font-medium">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {detailEmployee.active_badge && (
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-2">Active Badge</p>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                  <span className="text-sm font-semibold text-emerald-800">Badge #{detailEmployee.active_badge.badge_number}</span>
                  {detailEmployee.active_badge.sr_number && <span className="text-xs text-emerald-600 dark:text-emerald-400">SR: {detailEmployee.active_badge.sr_number}</span>}
                </div>
              </div>
            )}
            {detailEmployee.parking_records?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-2">Active Parking</p>
                {detailEmployee.parking_records.map(p => (
                  <div key={p._id} className="p-3 rounded-xl bg-slate-50 dark:bg-blue-500/10 border border-blue-100 dark:border-slate-800/20 flex items-center gap-3">
                    <StatusBadge status={p.parking_type} />
                    <span className="text-sm font-mono font-semibold text-blue-800 dark:text-blue-300">{p.car_plate_number}</span>
                    {p.assigned_slot?.slot_code && <span className="text-xs text-slate-900 dark:text-blue-400">Slot: {p.assigned_slot.slot_code}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
