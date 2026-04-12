import { useEffect, useState, useCallback } from 'react';
import { fetchBadges, issueAccessBadge, deactivateBadge, fetchTenants, fetchEmployees } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const DEACTIVATION_REASONS = ['STOLEN', 'DAMAGED', 'EMPLOYEE_LEFT', 'LOST', 'REPLACED', 'OTHER'];

export default function Badges() {
  const { toast } = useToast();
  const [badges, setBadges] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tenant_id: '', status: '' });
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ employee_id: '', badge_number: '', sr_number: '', sr_number_secondary: '', access_level: '', access_level_description: '', remarks: '' });
  const [deactivateForm, setDeactivateForm] = useState({ deactivation_reason: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tenantFilter, setTenantFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [badgesRes, tenantsRes] = await Promise.all([
        fetchBadges({ page, limit: 15, ...filters }),
        fetchTenants({ limit: 100, status: 'ACTIVE' }),
      ]);
      setBadges(badgesRes?.data?.badges ?? []);
      setPagination(badgesRes?.data?.pagination ?? null);
      setTenants(tenantsRes?.data?.tenants ?? []);
    } catch (e) { toast.error('Error', e.message); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!tenantFilter) { setEmployees([]); return; }
    fetchEmployees({ tenant_id: tenantFilter, status: 'ACTIVE', limit: 100 })
      .then(r => setEmployees(r?.data?.employees ?? []))
      .catch(() => {});
  }, [tenantFilter]);

  const openIssue = () => { setForm({ employee_id: '', badge_number: '', sr_number: '', sr_number_secondary: '', access_level: '', access_level_description: '', remarks: '' }); setTenantFilter(''); setModal('issue'); };
  const openDeactivate = (b) => { setEditing(b); setDeactivateForm({ deactivation_reason: '', remarks: '' }); setModal('deactivate'); };

  const handleIssue = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const payload = { employee_id: form.employee_id, badge_number: Number(form.badge_number), sr_number: form.sr_number || undefined, sr_number_secondary: form.sr_number_secondary ? Number(form.sr_number_secondary) : undefined, access_level: form.access_level || undefined, access_level_description: form.access_level_description || undefined, remarks: form.remarks || undefined };
      await issueAccessBadge(payload);
      toast.success('Success', 'Badge issued successfully.'); setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDeactivate = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      await deactivateBadge(editing._id, { deactivation_reason: deactivateForm.deactivation_reason, remarks: deactivateForm.remarks || undefined });
      toast.success('Success', 'Badge deactivated.'); setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'badge_number', label: 'Badge #', render: r => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-sm font-mono font-bold">
        #{r.badge_number}
      </span>
    )},
    { key: 'employee', label: 'Employee', render: r => (
      <div>
        <p className="text-sm font-semibold text-slate-800">{r.employee_id?.full_name || '—'}</p>
        {r.employee_id?.id_card_number && <p className="text-xs text-slate-400 font-mono">{r.employee_id.id_card_number}</p>}
      </div>
    )},
    { key: 'company', label: 'Company', render: r => <span className="text-sm text-slate-600">{r.tenant_id?.company_name || '—'}</span> },
    { key: 'sr_number', label: 'SR Number', render: r => r.sr_number ? <span className="text-xs font-mono text-slate-600">{r.sr_number}</span> : <span className="text-slate-300">—</span> },
    { key: 'access_level', label: 'Access Level', render: r => r.access_level || <span className="text-slate-300">—</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'issued_at', label: 'Issued', render: r => <span className="text-xs text-slate-500">{new Date(r.issued_at).toLocaleDateString()}</span> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1.5 justify-end">
        {r.status === 'ACTIVE' && (
          <button onClick={() => openDeactivate(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">Deactivate</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Access Badges"
        subtitle="Issue and manage employee access badges"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>}
        actions={
          <button onClick={openIssue} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Issue Badge
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Company</label>
          <select value={filters.tenant_id} onChange={e => { setFilters(f => ({ ...f, tenant_id: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
            <option value="">All Companies</option>
            {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
          <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
        <button onClick={() => { setFilters({ tenant_id: '', status: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Clear</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={badges} loading={loading} emptyMessage="No badges found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Issue Badge Modal */}
      <Modal isOpen={modal === 'issue'} onClose={() => setModal(null)} title="Issue Access Badge" size="large">
        <form onSubmit={handleIssue} className="space-y-5">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Filter by Company</label>
            <select value={tenantFilter} onChange={e => setTenantFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
              <option value="">Select company first</option>
              {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name}</option>)}
            </select>
          </div>
          <SelectInput label="Employee" required value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}>
            <option value="">Select employee</option>
            {employees.map(e => <option key={e._id} value={e._id}>{e.full_name} {e.id_card_number ? `(${e.id_card_number})` : ''}</option>)}
          </SelectInput>
          <TextInput label="Badge Number" required type="number" value={form.badge_number} onChange={e => setForm(f => ({ ...f, badge_number: e.target.value }))} placeholder="e.g. 1001" />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="SR Number" value={form.sr_number} onChange={e => setForm(f => ({ ...f, sr_number: e.target.value }))} placeholder="SR-001" />
            <TextInput label="SR Number Secondary" type="number" value={form.sr_number_secondary} onChange={e => setForm(f => ({ ...f, sr_number_secondary: e.target.value }))} placeholder="1001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Access Level" value={form.access_level} onChange={e => setForm(f => ({ ...f, access_level: e.target.value }))} placeholder="Level 1" />
            <TextInput label="Access Level Description" value={form.access_level_description} onChange={e => setForm(f => ({ ...f, access_level_description: e.target.value }))} placeholder="Full access" />
          </div>
          <TextareaInput label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Issuing...' : 'Issue Badge'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Modal */}
      <Modal isOpen={modal === 'deactivate'} onClose={() => setModal(null)} title={`Deactivate Badge #${editing?.badge_number}`}>
        <form onSubmit={handleDeactivate} className="space-y-4">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <Alert type="warning" message={`You are about to deactivate badge #${editing?.badge_number} for ${editing?.employee_id?.full_name}.`} />
          <SelectInput label="Deactivation Reason" required value={deactivateForm.deactivation_reason} onChange={e => setDeactivateForm(f => ({ ...f, deactivation_reason: e.target.value }))}>
            <option value="">Select reason</option>
            {DEACTIVATION_REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </SelectInput>
          <TextareaInput label="Remarks" value={deactivateForm.remarks} onChange={e => setDeactivateForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Deactivating...' : 'Deactivate Badge'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
