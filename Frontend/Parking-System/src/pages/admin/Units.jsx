import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchUnits, createUnit, updateUnit, deleteUnit } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';
import StatCard from '../../Components/common/StatCard.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';

const EMPTY = { floor: '', unit_number: '', zone: '', unit_space_sqm: '', owner_name: '', owner_qb_code: '', remarks: '' };

export default function Units() {
  useDocumentTitle('Units');
  const { toast } = useToast();
  const [units, setUnits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ floor: '', zone: '' });
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchUnits({ page, limit: 15, ...filters });
      setUnits(res?.data?.units ?? []);
      setPagination(res?.data?.pagination ?? null);
    } catch (e) { toast.error('Error', e.message); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setFormError(''); setModal('form'); };
  const openEdit = (u) => {
    setForm({ floor: u.floor, unit_number: u.unit_number, zone: u.zone || '', unit_space_sqm: u.unit_space_sqm, owner_name: u.owner?.name || '', owner_qb_code: u.owner?.qb_code || '', remarks: u.remarks || '' });
    setEditing(u);
    setFormError('');
    setModal('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      const payload = {
        floor: form.floor, unit_number: form.unit_number, zone: form.zone || undefined,
        unit_space_sqm: Number(form.unit_space_sqm),
        owner: { name: form.owner_name, qb_code: form.owner_qb_code || undefined },
        remarks: form.remarks || undefined,
      };
      if (editing) { await updateUnit(editing._id, payload); toast.success('Success', 'Unit updated.'); }
      else { await createUnit(payload); toast.success('Success', 'Unit created.'); }
      setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete unit ${u.unit_number} on floor ${u.floor}?`)) return;
    try { await deleteUnit(u._id); toast.success('Success', 'Unit deleted.'); load(); }
    catch (e) { toast.error('Error', e.message); }
  };

  const columns = useMemo(() => [
    { key: 'floor', label: 'Floor', render: r => <span className="font-semibold text-slate-800 dark:text-slate-200">{r.floor}</span> },
    { key: 'unit_number', label: 'Unit No.', render: r => <span className="font-mono text-slate-700 dark:text-slate-300">{r.unit_number}</span> },
    { key: 'zone', label: 'Zone', render: r => r.zone || <span className="text-slate-300">—</span> },
    { key: 'unit_space_sqm', label: 'Area (sqm)', render: r => `${r.unit_space_sqm} m²` },
    { key: 'max_card_limit', label: 'Card Limit', render: r => (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold ring-1 ring-blue-100">{r.max_card_limit}</span>
    )},
    { key: 'owner', label: 'Owner', render: r => (
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{r.owner?.name}</p>
        {r.owner?.qb_code && <p className="text-xs text-slate-400 dark:text-slate-500">{r.owner.qb_code}</p>}
      </div>
    )},
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => openEdit(r)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">Edit</button>
        <button onClick={() => handleDelete(r)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">Delete</button>
      </div>
    )},
  ], []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Units"
        subtitle="Manage building units and their configurations"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Unit
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Floor</label>
          <input value={filters.floor} onChange={e => { setFilters(f => ({ ...f, floor: e.target.value })); setPage(1); }}
            placeholder="e.g. 1, 2, B1" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Zone</label>
          <input value={filters.zone} onChange={e => { setFilters(f => ({ ...f, zone: e.target.value })); setPage(1); }}
            placeholder="Zone A, B..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <button onClick={() => { setFilters({ floor: '', zone: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={units} loading={loading} emptyMessage="No units found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Form Modal */}
      <Modal isOpen={modal === 'form'} onClose={() => setModal(null)} title={editing ? 'Edit Unit' : 'Add New Unit'} size="large">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Floor" required value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="e.g. 1, 2, B1" />
            <TextInput label="Unit Number" required value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} placeholder="e.g. 101, A-02" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Zone" value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} placeholder="Zone A" />
            <TextInput label="Unit Space (sqm)" required type="number" min="1" value={form.unit_space_sqm} onChange={e => setForm(f => ({ ...f, unit_space_sqm: e.target.value }))} placeholder="e.g. 90"
              hint={form.unit_space_sqm ? `Card limit: ${Math.floor(Number(form.unit_space_sqm) / 9)}` : undefined} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="Owner Name" required value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} placeholder="Owner full name" />
            <TextInput label="Owner QB Code" value={form.owner_qb_code} onChange={e => setForm(f => ({ ...f, owner_qb_code: e.target.value }))} placeholder="QB-001" />
          </div>
          <TextareaInput label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Saving...' : editing ? 'Update Unit' : 'Create Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
