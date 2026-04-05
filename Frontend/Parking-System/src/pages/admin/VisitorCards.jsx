import React, { useEffect, useState, useCallback } from 'react';
import { fetchVisitorCards, issueVisitorCard, checkInVisitor, checkOutVisitor, deactivateVisitorCard, fetchTenants } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';

export default function VisitorCards() {
  const [cards, setCards] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tenant_id: '', status: '' });
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [issueForm, setIssueForm] = useState({ tenant_id: '', badge_number: '', remarks: '' });
  const [deactivateForm, setDeactivateForm] = useState({ deactivation_reason: '', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cardsRes, tenRes] = await Promise.all([
        fetchVisitorCards({ page, limit: 15, ...filters }),
        fetchTenants({ limit: 100, status: 'ACTIVE' }),
      ]);
      setCards(cardsRes?.data?.cards ?? []);
      setPagination(cardsRes?.data?.pagination ?? null);
      setTenants(tenRes?.data?.tenants ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const openIssue = () => { setIssueForm({ tenant_id: '', badge_number: '', remarks: '' }); setModal('issue'); };
  const openDeactivate = (c) => { setEditing(c); setDeactivateForm({ deactivation_reason: '', remarks: '' }); setModal('deactivate'); };

  const handleIssue = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await issueVisitorCard({ tenant_id: issueForm.tenant_id, badge_number: Number(issueForm.badge_number), remarks: issueForm.remarks || undefined });
      setSuccess('Visitor card issued.'); setModal(null); load();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleCheckIn = async (card) => {
    try { await checkInVisitor(card._id); setSuccess('Visitor checked in.'); load(); }
    catch (e) { setError(e.message); }
  };

  const handleCheckOut = async (card) => {
    try { await checkOutVisitor(card._id); setSuccess('Visitor checked out.'); load(); }
    catch (e) { setError(e.message); }
  };

  const handleDeactivate = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await deactivateVisitorCard(editing._id, { deactivation_reason: deactivateForm.deactivation_reason, remarks: deactivateForm.remarks || undefined });
      setSuccess('Visitor card deactivated.'); setModal(null); load();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'badge_number', label: 'Badge #', render: r => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-sm font-mono font-bold">
        #{r.badge_number}
      </span>
    )},
    { key: 'tenant', label: 'Company', render: r => (
      <div>
        <p className="text-sm font-semibold text-slate-800">{r.tenant_id?.company_name || '—'}</p>
        <p className="text-xs text-slate-400">Floor {r.tenant_id?.unit_id?.floor} · {r.tenant_id?.unit_id?.unit_number}</p>
      </div>
    )},
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} pulse={r.status === 'IN_USE'} /> },
    { key: 'issued_at', label: 'Issued', render: r => <span className="text-xs text-slate-500">{new Date(r.issued_at).toLocaleDateString()}</span> },
    { key: 'remarks', label: 'Remarks', render: r => r.remarks ? <span className="text-xs text-slate-500 truncate max-w-[120px] block">{r.remarks}</span> : <span className="text-slate-300">—</span> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1.5 justify-end">
        {r.status === 'AVAILABLE' && (
          <button onClick={() => handleCheckIn(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">Check In</button>
        )}
        {r.status === 'IN_USE' && (
          <button onClick={() => handleCheckOut(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Check Out</button>
        )}
        {(r.status === 'AVAILABLE' || r.status === 'IN_USE') && (
          <button onClick={() => openDeactivate(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">Deactivate</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Visitor Cards"
        subtitle="Issue and manage visitor access cards"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
        actions={
          <button onClick={openIssue} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Issue Card
          </button>
        }
      />

      {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess('')} />}

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
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="LOST">Lost</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
        <button onClick={() => { setFilters({ tenant_id: '', status: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Clear</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={cards} loading={loading} emptyMessage="No visitor cards found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Issue Modal */}
      <Modal isOpen={modal === 'issue'} onClose={() => setModal(null)} title="Issue Visitor Card">
        <form onSubmit={handleIssue} className="space-y-4">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
          <SelectInput label="Company (Tenant)" required value={issueForm.tenant_id} onChange={e => setIssueForm(f => ({ ...f, tenant_id: e.target.value }))}>
            <option value="">Select company</option>
            {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name} (quota: {t.visitor_card_quota})</option>)}
          </SelectInput>
          <TextInput label="Badge Number" required type="number" value={issueForm.badge_number} onChange={e => setIssueForm(f => ({ ...f, badge_number: e.target.value }))} placeholder="e.g. 5001" />
          <TextareaInput label="Remarks" value={issueForm.remarks} onChange={e => setIssueForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Issuing...' : 'Issue Card'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Modal */}
      <Modal isOpen={modal === 'deactivate'} onClose={() => setModal(null)} title={`Deactivate Card #${editing?.badge_number}`}>
        <form onSubmit={handleDeactivate} className="space-y-4">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
          <SelectInput label="Reason" required value={deactivateForm.deactivation_reason} onChange={e => setDeactivateForm(f => ({ ...f, deactivation_reason: e.target.value }))}>
            <option value="">Select reason</option>
            <option value="LOST">Lost</option>
            <option value="DAMAGED">Damaged</option>
            <option value="OTHER">Other</option>
          </SelectInput>
          <TextareaInput label="Remarks" value={deactivateForm.remarks} onChange={e => setDeactivateForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Deactivating...' : 'Deactivate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
