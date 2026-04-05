import React, { useEffect, useState, useCallback } from 'react';
import { fetchParkingRecords, createParkingRecord, cancelParkingRecord, fetchTenants, fetchEmployees, fetchRentalContracts } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';

export default function ParkingRecords() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tenant_id: '', parking_type: '', status: '' });
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ employee_id: '', car_plate_number: '', parking_type: 'ASSIGNED', badge_id: '', sticker_number: '', car_tag: '', sr_number: '', slot_code: '', floor_number: '', rental_contract_id: '', remarks: '' });
  const [cancelForm, setCancelForm] = useState({ remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tenantFilter, setTenantFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, tenRes] = await Promise.all([
        fetchParkingRecords({ page, limit: 15, ...filters }),
        fetchTenants({ limit: 100, status: 'ACTIVE' }),
      ]);
      setRecords(recRes?.data?.records ?? []);
      setPagination(recRes?.data?.pagination ?? null);
      setTenants(tenRes?.data?.tenants ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!tenantFilter) { setEmployees([]); setContracts([]); return; }
    Promise.all([
      fetchEmployees({ tenant_id: tenantFilter, status: 'ACTIVE', limit: 100 }),
      fetchRentalContracts({ tenant_id: tenantFilter, status: 'ACTIVE', limit: 100 }),
    ]).then(([empRes, conRes]) => {
      setEmployees(empRes?.data?.employees ?? []);
      setContracts(conRes?.data?.contracts ?? []);
    }).catch(() => {});
  }, [tenantFilter]);

  const openCreate = () => { setForm({ employee_id: '', car_plate_number: '', parking_type: 'ASSIGNED', badge_id: '', sticker_number: '', car_tag: '', sr_number: '', slot_code: '', floor_number: '', rental_contract_id: '', remarks: '' }); setTenantFilter(''); setModal('create'); };
  const openCancel = (r) => { setEditing(r); setCancelForm({ remarks: '' }); setModal('cancel'); };

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      const payload = {
        employee_id: form.employee_id, car_plate_number: form.car_plate_number, parking_type: form.parking_type,
        badge_id: form.badge_id ? Number(form.badge_id) : undefined,
        sticker_number: form.sticker_number || undefined, car_tag: form.car_tag ? Number(form.car_tag) : undefined,
        sr_number: form.sr_number || undefined, remarks: form.remarks || undefined,
        ...(form.parking_type === 'ASSIGNED' ? { assigned_slot: { slot_code: form.slot_code, floor_number: form.floor_number } } : {}),
        ...(form.parking_type === 'RENTAL' ? { rental_contract_id: form.rental_contract_id } : {}),
      };
      await createParkingRecord(payload);
      setSuccess('Parking record created.'); setModal(null); load();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await cancelParkingRecord(editing._id, { remarks: cancelForm.remarks || undefined });
      setSuccess('Parking record cancelled.'); setModal(null); load();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'employee', label: 'Employee', render: r => (
      <div>
        <p className="text-sm font-semibold text-slate-800">{r.employee_id?.full_name || '—'}</p>
        {r.employee_id?.id_card_number && <p className="text-xs text-slate-400 font-mono">{r.employee_id.id_card_number}</p>}
      </div>
    )},
    { key: 'company', label: 'Company', render: r => <span className="text-sm text-slate-600">{r.tenant_id?.company_name || '—'}</span> },
    { key: 'car_plate_number', label: 'Plate', render: r => <span className="font-mono text-sm font-semibold text-slate-800">{r.car_plate_number}</span> },
    { key: 'parking_type', label: 'Type', render: r => <StatusBadge status={r.parking_type} /> },
    { key: 'slot', label: 'Slot', render: r => r.assigned_slot?.slot_code ? (
      <span className="text-xs font-mono text-slate-700">{r.assigned_slot.slot_code} · F{r.assigned_slot.floor_number}</span>
    ) : <span className="text-slate-300">—</span> },
    { key: 'contract', label: 'Contract', render: r => r.rental_contract_id?.contract_ref_number ? (
      <span className="text-xs text-slate-600">{r.rental_contract_id.contract_ref_number}</span>
    ) : <span className="text-slate-300">—</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'assigned_at', label: 'Assigned', render: r => <span className="text-xs text-slate-500">{new Date(r.assigned_at).toLocaleDateString()}</span> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1.5 justify-end">
        {r.status === 'ACTIVE' && (
          <button onClick={() => openCancel(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Cancel</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Parking Records"
        subtitle="Manage parking slot assignments for employees"
        icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
        actions={
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Assign Parking
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
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Type</label>
          <select value={filters.parking_type} onChange={e => { setFilters(f => ({ ...f, parking_type: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
            <option value="">All Types</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="POOL">Pool</option>
            <option value="RENTAL">Rental</option>
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
          <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button onClick={() => { setFilters({ tenant_id: '', parking_type: '', status: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Clear</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={records} loading={loading} emptyMessage="No parking records found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Create Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Assign Parking" size="large">
        <form onSubmit={handleCreate} className="space-y-5">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
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
            {employees.map(e => <option key={e._id} value={e._id}>{e.full_name}</option>)}
          </SelectInput>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Car Plate Number" required value={form.car_plate_number} onChange={e => setForm(f => ({ ...f, car_plate_number: e.target.value }))} placeholder="ABC-1234" />
            <SelectInput label="Parking Type" required value={form.parking_type} onChange={e => setForm(f => ({ ...f, parking_type: e.target.value }))}>
              <option value="ASSIGNED">Assigned</option>
              <option value="POOL">Pool</option>
              <option value="RENTAL">Rental</option>
            </SelectInput>
          </div>
          {form.parking_type === 'ASSIGNED' && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <TextInput label="Slot Code" required value={form.slot_code} onChange={e => setForm(f => ({ ...f, slot_code: e.target.value }))} placeholder="A-01" />
              <TextInput label="Floor Number" required value={form.floor_number} onChange={e => setForm(f => ({ ...f, floor_number: e.target.value }))} placeholder="1" />
            </div>
          )}
          {form.parking_type === 'RENTAL' && (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <SelectInput label="Rental Contract" required value={form.rental_contract_id} onChange={e => setForm(f => ({ ...f, rental_contract_id: e.target.value }))}>
                <option value="">Select contract</option>
                {contracts.map(c => <option key={c._id} value={c._id}>{c.contract_ref_number} ({c.slots_allocated - c.slots_used} slots remaining)</option>)}
              </SelectInput>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <TextInput label="Badge ID" type="number" value={form.badge_id} onChange={e => setForm(f => ({ ...f, badge_id: e.target.value }))} placeholder="1001" />
            <TextInput label="Sticker Number" value={form.sticker_number} onChange={e => setForm(f => ({ ...f, sticker_number: e.target.value }))} placeholder="STK-001" />
            <TextInput label="SR Number" value={form.sr_number} onChange={e => setForm(f => ({ ...f, sr_number: e.target.value }))} placeholder="SR-001" />
          </div>
          <TextareaInput label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Assigning...' : 'Assign Parking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={modal === 'cancel'} onClose={() => setModal(null)} title="Cancel Parking Record">
        <form onSubmit={handleCancel} className="space-y-4">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
          <Alert type="warning" message={`Cancel parking for ${editing?.employee_id?.full_name} — plate ${editing?.car_plate_number}?`} />
          <TextareaInput label="Remarks" value={cancelForm.remarks} onChange={e => setCancelForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Reason for cancellation..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Back</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Cancelling...' : 'Cancel Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
