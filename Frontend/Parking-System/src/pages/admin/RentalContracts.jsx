import { useEffect, useState, useCallback } from 'react';
import { fetchRentalContracts, createRentalContract, updateRentalContract, deleteRentalContract, fetchTenants } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY = { tenant_id: '', contract_ref_number: '', company_name: '', floor: '', unit: '', slots_allocated: '', duration_months: '', start_date: '', end_date: '', remarks: '' };

export default function RentalContracts() {
  const { toast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tenant_id: '', status: '' });
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [conRes, tenRes] = await Promise.all([
        fetchRentalContracts({ page, limit: 15, ...filters }),
        fetchTenants({ limit: 100, status: 'ACTIVE' }),
      ]);
      setContracts(conRes?.data?.contracts ?? []);
      setPagination(conRes?.data?.pagination ?? null);
      setTenants(tenRes?.data?.tenants ?? []);
    } catch (e) { toast.error('Error', e.message); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal('form'); };
  const openEdit = (c) => {
    setForm({ tenant_id: c.tenant_id?._id || c.tenant_id || '', contract_ref_number: c.contract_ref_number, company_name: c.company_name, floor: c.floor || '', unit: c.unit || '', slots_allocated: c.slots_allocated, duration_months: c.duration_months, start_date: c.start_date?.split('T')[0] || '', end_date: c.end_date?.split('T')[0] || '', remarks: c.remarks || '' });
    setEditing(c); setModal('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const payload = { ...form, slots_allocated: Number(form.slots_allocated), duration_months: Number(form.duration_months), floor: form.floor || undefined, unit: form.unit || undefined, remarks: form.remarks || undefined };
      if (editing) { await updateRentalContract(editing._id, payload); toast.success('Success', 'Contract updated.'); }
      else { await createRentalContract(payload); toast.success('Success', 'Contract created.'); }
      setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Delete contract "${c.contract_ref_number}"?`)) return;
    try { await deleteRentalContract(c._id); toast.success('Success', 'Contract deleted.'); load(); }
    catch (e) { toast.error('Error', e.message); }
  };

  const columns = [
    { key: 'contract_ref_number', label: 'Ref #', render: r => <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">{r.contract_ref_number}</span> },
    { key: 'company_name', label: 'Company', render: r => <span className="text-sm text-slate-700 dark:text-slate-300">{r.company_name}</span> },
    { key: 'tenant', label: 'Tenant', render: r => <span className="text-xs text-slate-500 dark:text-slate-400">{r.tenant_id?.company_name || '—'}</span> },
    { key: 'slots', label: 'Slots', render: r => (
      <div className="text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{r.slots_used}</span>
        <span className="text-slate-400 dark:text-slate-500"> / {r.slots_allocated}</span>
        <span className="text-slate-400 dark:text-slate-500"> used</span>
      </div>
    )},
    { key: 'duration', label: 'Duration', render: r => <span className="text-xs text-slate-600 dark:text-slate-400">{r.duration_months} months</span> },
    { key: 'end_date', label: 'Expires', render: r => {
      const days = r.days_until_expiry ?? Math.ceil((new Date(r.end_date) - new Date()) / 86400000);
      return (
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(r.end_date).toLocaleDateString()}</p>
          <p className={`text-xs font-medium ${days < 0 ? 'text-red-500' : days < 30 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
          </p>
        </div>
      );
    }},
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1.5 justify-end">
        {r.status !== 'CANCELLED' && <button onClick={() => openEdit(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">Edit</button>}
        <button onClick={() => handleDelete(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">Delete</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Rental Contracts"
        subtitle="Manage temporary parking rental contracts"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Contract
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Company</label>
          <select value={filters.tenant_id} onChange={e => { setFilters(f => ({ ...f, tenant_id: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white dark:bg-slate-900">
            <option value="">All Companies</option>
            {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
          <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white dark:bg-slate-900">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="NEAR_EXPIRED">Near Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button onClick={() => { setFilters({ tenant_id: '', status: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Clear</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={contracts} loading={loading} emptyMessage="No rental contracts found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Form Modal */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editing ? 'Edit Contract' : 'New Rental Contract'} size="large">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <SelectInput label="Tenant" required value={form.tenant_id} onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))}>
            <option value="">Select tenant</option>
            {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name}</option>)}
          </SelectInput>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Contract Ref Number" required value={form.contract_ref_number} onChange={e => setForm(f => ({ ...f, contract_ref_number: e.target.value }))} placeholder="RC-2024-001" />
            <TextInput label="Company Name" required value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Company name on contract" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Floor" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="e.g. 3" />
            <TextInput label="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. 301" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Slots Allocated" required type="number" min="1" value={form.slots_allocated} onChange={e => setForm(f => ({ ...f, slots_allocated: e.target.value }))} placeholder="5" />
            <TextInput label="Duration (months)" required type="number" min="1" value={form.duration_months} onChange={e => setForm(f => ({ ...f, duration_months: e.target.value }))} placeholder="12" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Start Date" required type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <TextInput label="End Date" required type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          {editing && (
            <SelectInput label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="NEAR_EXPIRED">Near Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </SelectInput>
          )}
          <TextareaInput label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Saving...' : editing ? 'Update Contract' : 'Create Contract'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
