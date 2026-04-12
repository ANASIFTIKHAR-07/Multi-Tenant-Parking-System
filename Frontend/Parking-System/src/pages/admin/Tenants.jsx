import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchTenants, createTenant, updateTenant, deleteTenant, fetchUnits } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

const EMPTY = { unit_id: '', qb_code: '', company_name: '', status: 'ACTIVE', lease_start: '', lease_end: '', visitor_card_quota: 0, remarks: '' };

export default function Tenants() {
  useDocumentTitle('Tenants');
  const { toast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', floor: '' });
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [quotaModal, setQuotaModal] = useState(null);
  const [quotaForm, setQuotaForm] = useState({ assigned: 0, pool: 0, rental: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tenantsRes, unitsRes] = await Promise.all([
        fetchTenants({ page, limit: 15, ...filters }),
        fetchUnits({ limit: 100 }),
      ]);
      setTenants(tenantsRes?.data?.tenants ?? []);
      setPagination(tenantsRes?.data?.pagination ?? null);
      setUnits(unitsRes?.data?.units ?? []);
    } catch (e) { toast.error('Error', e.message); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setFormError(''); setModal('form'); };
  const openEdit = (t) => {
    setForm({
      unit_id: t.unit_id?._id || t.unit_id || '',
      qb_code: t.qb_code || '', company_name: t.company_name,
      status: t.status, lease_start: t.lease_start ? t.lease_start.split('T')[0] : '',
      lease_end: t.lease_end ? t.lease_end.split('T')[0] : '',
      visitor_card_quota: t.visitor_card_quota || 0, remarks: t.remarks || '',
    });
    setEditing(t); setFormError(''); setModal('form');
  };
  const openQuota = (t) => {
    setEditing(t);
    setQuotaForm({ assigned: t.parking_quota?.assigned?.allocated || 0, pool: t.parking_quota?.pool?.allocated || 0, rental: t.parking_quota?.rental?.allocated || 0 });
    setFormError('');
    setQuotaModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const payload = { ...form, visitor_card_quota: Number(form.visitor_card_quota), lease_start: form.lease_start || undefined, lease_end: form.lease_end || undefined, qb_code: form.qb_code || undefined, remarks: form.remarks || undefined };
      if (editing) { await updateTenant(editing._id, payload); toast.success('Success', 'Tenant updated.'); }
      else { await createTenant(payload); toast.success('Success', 'Tenant created.'); }
      setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleQuotaSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      await updateTenant(editing._id, { parking_quota: { assigned: { allocated: Number(quotaForm.assigned) }, pool: { allocated: Number(quotaForm.pool) }, rental: { allocated: Number(quotaForm.rental) } } });
      toast.success('Success', 'Parking quota updated.'); setQuotaModal(false); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (t) => {
    if (!confirm(`Delete tenant "${t.company_name}"?`)) return;
    try { await deleteTenant(t._id); toast.success('Success', 'Tenant deleted.'); load(); }
    catch (e) { toast.error('Error', e.message); }
  };

  const columns = useMemo(() => [
    { key: 'company_name', label: 'Company', render: r => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{r.company_name?.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.company_name}</p>
          {r.qb_code && <p className="text-xs text-slate-400 dark:text-slate-500">{r.qb_code}</p>}
        </div>
      </div>
    )},
    { key: 'unit', label: 'Unit', render: r => (
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Floor {r.unit_id?.floor} · {r.unit_id?.unit_number}</p>
        {r.unit_id?.zone && <p className="text-xs text-slate-400 dark:text-slate-500">{r.unit_id.zone}</p>}
      </div>
    )},
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'cards', label: 'Cards', render: r => (
      <div className="text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{r.card_quota?.active_cards}</span>
        <span className="text-slate-400 dark:text-slate-500"> / {r.card_quota?.max_limit}</span>
      </div>
    )},
    { key: 'parking', label: 'Parking Quota', render: r => (
      <div className="flex gap-2 text-xs">
        <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">A:{r.parking_quota?.assigned?.used}/{r.parking_quota?.assigned?.allocated}</span>
        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">P:{r.parking_quota?.pool?.used}/{r.parking_quota?.pool?.allocated}</span>
        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium">R:{r.parking_quota?.rental?.used}/{r.parking_quota?.rental?.allocated}</span>
      </div>
    )},
    { key: 'lease', label: 'Lease', render: r => r.lease_end ? (
      <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(r.lease_end).toLocaleDateString()}</span>
    ) : <span className="text-slate-300 text-xs">—</span> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1.5 justify-end">
        <button onClick={() => openQuota(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">Quota</button>
        <button onClick={() => openEdit(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">Edit</button>
        <button onClick={() => handleDelete(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">Delete</button>
      </div>
    )},
  ], []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Tenants"
        subtitle="Manage company tenants and their parking quotas"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Tenant
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
          <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all bg-white dark:bg-slate-900">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Floor</label>
          <input value={filters.floor} onChange={e => { setFilters(f => ({ ...f, floor: e.target.value })); setPage(1); }}
            placeholder="Floor number" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all" />
        </div>
        <button onClick={() => { setFilters({ status: '', floor: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Clear</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={tenants} loading={loading} emptyMessage="No tenants found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Tenant Form Modal */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editing ? 'Edit Tenant' : 'Add Tenant'} size="large">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Company Name" required value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Acme Corp" />
            <TextInput label="QB Code" value={form.qb_code} onChange={e => setForm(f => ({ ...f, qb_code: e.target.value }))} placeholder="QB-001" />
          </div>
          <SelectInput label="Unit" required value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}>
            <option value="">Select a unit</option>
            {units.map(u => <option key={u._id} value={u._id}>Floor {u.floor} · {u.unit_number} {u.zone ? `(${u.zone})` : ''}</option>)}
          </SelectInput>
          <SelectInput label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </SelectInput>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Lease Start" type="date" value={form.lease_start} onChange={e => setForm(f => ({ ...f, lease_start: e.target.value }))} />
            <TextInput label="Lease End" type="date" value={form.lease_end} onChange={e => setForm(f => ({ ...f, lease_end: e.target.value }))} />
          </div>
          <TextInput label="Visitor Card Quota" type="number" min="0" value={form.visitor_card_quota} onChange={e => setForm(f => ({ ...f, visitor_card_quota: e.target.value }))} />
          <TextareaInput label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Saving...' : editing ? 'Update' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quota Modal */}
      <Modal isOpen={!!quotaModal} onClose={() => setQuotaModal(false)} title={`Parking Quota — ${editing?.company_name}`}>
        <form onSubmit={handleQuotaSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <p className="text-sm text-slate-500 dark:text-slate-400">Set the number of allocated parking slots per type for this tenant.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput label="Assigned" type="number" min="0" value={quotaForm.assigned} onChange={e => setQuotaForm(f => ({ ...f, assigned: e.target.value }))} />
            <TextInput label="Pool" type="number" min="0" value={quotaForm.pool} onChange={e => setQuotaForm(f => ({ ...f, pool: e.target.value }))} />
            <TextInput label="Rental" type="number" min="0" value={quotaForm.rental} onChange={e => setQuotaForm(f => ({ ...f, rental: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setQuotaModal(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Saving...' : 'Update Quota'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
