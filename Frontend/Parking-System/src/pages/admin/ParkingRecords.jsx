import { useEffect, useState, useCallback } from 'react';
import { fetchParkingRecords, createParkingRecord, cancelParkingRecord, updateParkingRecord, fetchTenants, fetchEmployees, fetchRentalContracts } from '../../services/adminApi.js';
import PageHeader from '../../Components/common/PageHeader.jsx';
import DataTable from '../../Components/common/DataTable.jsx';
import Pagination from '../../Components/common/Pagination.jsx';
import Alert from '../../Components/common/Alert.jsx';
import Modal from '../../Components/common/Modal.jsx';
import StatusBadge from '../../Components/common/StatusBadge.jsx';
import { TextInput, SelectInput, TextareaInput } from '../../Components/common/FormField.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY_FORM = {
  employee_id: '', car_plate_number: '', parking_type: 'ASSIGNED',
  badge_id: '', sticker_number: '', car_tag: '', sr_number: '',
  slot_code: '', floor_number: '', rental_contract_id: '', remarks: '',
};

export default function ParkingRecords() {
  const { toast } = useToast();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tenant_id: '', parking_type: '', status: '' });
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [cancelForm, setCancelForm] = useState({ remarks: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tenantFilter, setTenantFilter] = useState('');
  // Track the selected employee's vehicles for the vehicle picker
  const [selectedEmployeeVehicles, setSelectedEmployeeVehicles] = useState([]);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState('');

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
    } catch (e) { toast.error('Error', e.message); }
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

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setTenantFilter('');
    setSelectedEmployeeVehicles([]);
    setSelectedVehiclePlate('');
    setModal('create');
  };
  const openCancel = (r) => { setEditing(r); setCancelForm({ remarks: '' }); setModal('cancel'); };

  const openEdit = (r) => {
    setEditing(r);
    setModal('edit');
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const payload = {
        badge_id:       editing.editBadgeId       !== undefined ? (editing.editBadgeId       ? Number(editing.editBadgeId)       : null) : undefined,
        sticker_number: editing.editStickerNumber !== undefined ? (editing.editStickerNumber || null) : undefined,
        car_tag:        editing.editCarTag        !== undefined ? (editing.editCarTag        ? Number(editing.editCarTag)        : null) : undefined,
        sr_number:      editing.editSrNumber      !== undefined ? (editing.editSrNumber      || null) : undefined,
        remarks:        editing.editRemarks       !== undefined ? (editing.editRemarks       || null) : undefined,
        ...(editing.parking_type === 'ASSIGNED' ? {
          assigned_slot: {
            slot_code:    editing.editSlotCode    || editing.assigned_slot?.slot_code,
            floor_number: editing.editFloorNumber || editing.assigned_slot?.floor_number,
          }
        } : {}),
      };
      await updateParkingRecord(editing._id, payload);
      toast.success('Success', 'Parking record updated.'); setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  // When employee is selected — load their vehicles and auto-fill
  const handleEmployeeChange = (employeeId) => {
    setForm(f => ({ ...f, employee_id: employeeId, car_plate_number: '', sticker_number: '', car_tag: '', badge_id: '', sr_number: '' }));
    setSelectedVehiclePlate('');

    if (!employeeId) { setSelectedEmployeeVehicles([]); return; }

    const emp = employees.find(e => e._id === employeeId);
    const vehicles = emp?.vehicles ?? [];
    setSelectedEmployeeVehicles(vehicles);

    // Auto-fill active badge info
    const badge = emp?.active_badge;
    if (badge) {
      setForm(f => ({
        ...f,
        employee_id: employeeId,
        badge_id:  badge.badge_number != null ? String(badge.badge_number) : '',
        sr_number: badge.sr_number    || '',
      }));
    }

    if (vehicles.length === 0) return;

    // Auto-select primary vehicle, or first if none marked primary
    const primary = vehicles.find(v => v.is_primary) || vehicles[0];
    applyVehicle(primary, badge);
    setSelectedVehiclePlate(primary.car_plate_number);
  };

  // When a specific vehicle is picked from the dropdown
  const handleVehicleChange = (plate) => {
    setSelectedVehiclePlate(plate);
    const v = selectedEmployeeVehicles.find(v => v.car_plate_number === plate);
    if (v) applyVehicle(v);
  };

  const applyVehicle = (v, badge) => {
    setForm(f => ({
      ...f,
      car_plate_number: v.car_plate_number || '',
      sticker_number:   v.sticker_number   || '',
      car_tag:          v.car_tag != null   ? String(v.car_tag) : '',
      // Only overwrite badge fields if badge is explicitly passed (on initial employee select)
      ...(badge !== undefined ? {
        badge_id:  badge?.badge_number != null ? String(badge.badge_number) : '',
        sr_number: badge?.sr_number    || '',
      } : {}),
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
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
      toast.success('Success', 'Parking record created.'); setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      await cancelParkingRecord(editing._id, { remarks: cancelForm.remarks || undefined });
      toast.success('Success', 'Parking record cancelled.'); setModal(null); load();
    } catch (e) { toast.error('Error', e.message); setFormError(e.message); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { key: 'employee', label: 'Employee', render: r => (
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.employee_id?.full_name || '—'}</p>
        {r.employee_id?.id_card_number && <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{r.employee_id.id_card_number}</p>}
      </div>
    )},
    { key: 'company', label: 'Company', render: r => <span className="text-sm text-slate-600 dark:text-slate-400">{r.tenant_id?.company_name || '—'}</span> },
    { key: 'car_plate_number', label: 'Plate', render: r => <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">{r.car_plate_number}</span> },
    { key: 'parking_type', label: 'Type', render: r => <StatusBadge status={r.parking_type} /> },
    { key: 'slot', label: 'Slot', render: r => r.assigned_slot?.slot_code ? (
      <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{r.assigned_slot.slot_code} · F{r.assigned_slot.floor_number}</span>
    ) : <span className="text-slate-300">—</span> },
    { key: 'contract', label: 'Contract', render: r => r.rental_contract_id?.contract_ref_number ? (
      <span className="text-xs text-slate-600 dark:text-slate-400">{r.rental_contract_id.contract_ref_number}</span>
    ) : <span className="text-slate-300">—</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'assigned_at', label: 'Assigned', render: r => <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(r.assigned_at).toLocaleDateString()}</span> },
    { key: 'actions', label: '', render: r => (
      <div className="flex items-center gap-1.5 justify-end">
        {r.status === 'ACTIVE' && (
          <button onClick={() => openEdit(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">Edit</button>
        )}
        {r.status === 'ACTIVE' && (
          <button onClick={() => openCancel(r)} className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">Cancel</button>
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
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Assign Parking
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
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Type</label>
          <select value={filters.parking_type} onChange={e => { setFilters(f => ({ ...f, parking_type: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all bg-white dark:bg-slate-900">
            <option value="">All Types</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="POOL">Pool</option>
            <option value="RENTAL">Rental</option>
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
          <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all bg-white dark:bg-slate-900">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button onClick={() => { setFilters({ tenant_id: '', parking_type: '', status: '' }); setPage(1); }} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Clear</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable columns={columns} data={records} loading={loading} emptyMessage="No parking records found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Create Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Assign Parking" size="large">
        <form onSubmit={handleCreate} className="space-y-5">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Filter by Company</label>
            <select value={tenantFilter} onChange={e => setTenantFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-200 transition-all bg-white dark:bg-slate-900">
              <option value="">Select company first</option>
              {tenants.map(t => <option key={t._id} value={t._id}>{t.company_name}</option>)}
            </select>
          </div>
          <SelectInput label="Employee" required value={form.employee_id} onChange={e => handleEmployeeChange(e.target.value)}>
            <option value="">Select employee</option>
            {employees.map(e => (
              <option key={e._id} value={e._id}>
                {e.full_name}{e.id_card_number ? ` — ${e.id_card_number}` : ''}
              </option>
            ))}
          </SelectInput>

          {/* Vehicle picker — shown when employee has vehicles */}
          {selectedEmployeeVehicles.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Registered Vehicles ({selectedEmployeeVehicles.length})
                </p>
                {/* Show active badge info inline */}
                {form.badge_id && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Badge #{form.badge_id}{form.sr_number ? ` · SR: ${form.sr_number}` : ''}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {selectedEmployeeVehicles.map(v => (
                  <button
                    key={v.car_plate_number}
                    type="button"
                    onClick={() => handleVehicleChange(v.car_plate_number)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selectedVehiclePlate === v.car_plate_number
                        ? 'border-slate-800 bg-slate-50 dark:bg-blue-500/10 ring-2 ring-slate-900/5'
                        : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 dark:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedVehiclePlate === v.car_plate_number ? 'bg-blue-600' : 'bg-slate-200'
                    }`}>
                      <svg className={`w-4 h-4 ${selectedVehiclePlate === v.car_plate_number ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold font-mono text-slate-800 dark:text-slate-200">{v.car_plate_number}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {[v.sticker_number && `Sticker: ${v.sticker_number}`, v.car_tag && `Tag: ${v.car_tag}`].filter(Boolean).join(' · ') || 'No sticker/tag'}
                      </p>
                    </div>
                    {v.is_primary && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:text-blue-400 flex-shrink-0">Primary</span>
                    )}
                    {selectedVehiclePlate === v.car_plate_number && (
                      <svg className="w-4 h-4 text-slate-900 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No vehicles warning */}
          {form.employee_id && selectedEmployeeVehicles.length === 0 && (
            <Alert type="warning" message="This employee has no registered vehicles. Add a vehicle to their profile first." />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Car Plate Number"
              required
              value={form.car_plate_number}
              onChange={e => setForm(f => ({ ...f, car_plate_number: e.target.value }))}
              placeholder="ABC-1234"
              hint="Auto-filled from selected vehicle"
            />
            <SelectInput label="Parking Type" required value={form.parking_type} onChange={e => setForm(f => ({ ...f, parking_type: e.target.value }))}>
              <option value="ASSIGNED">Assigned</option>
              <option value="POOL">Pool</option>
              <option value="RENTAL">Rental</option>
            </SelectInput>
          </div>
          {form.parking_type === 'ASSIGNED' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-blue-500/10 border border-blue-100 dark:border-slate-800/20">
              <TextInput label="Slot Code" required value={form.slot_code} onChange={e => setForm(f => ({ ...f, slot_code: e.target.value }))} placeholder="A-01" />
              <TextInput label="Floor Number" required value={form.floor_number} onChange={e => setForm(f => ({ ...f, floor_number: e.target.value }))} placeholder="1" />
            </div>
          )}
          {form.parking_type === 'RENTAL' && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
              <SelectInput label="Rental Contract" required value={form.rental_contract_id} onChange={e => setForm(f => ({ ...f, rental_contract_id: e.target.value }))}>
                <option value="">Select contract</option>
                {contracts.map(c => <option key={c._id} value={c._id}>{c.contract_ref_number} ({c.slots_allocated - c.slots_used} slots remaining)</option>)}
              </SelectInput>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput label="Badge ID" type="number" value={form.badge_id} onChange={e => setForm(f => ({ ...f, badge_id: e.target.value }))} placeholder="1001" />
            <TextInput label="Sticker Number" value={form.sticker_number} onChange={e => setForm(f => ({ ...f, sticker_number: e.target.value }))} placeholder="STK-001" />
            <TextInput label="SR Number" value={form.sr_number} onChange={e => setForm(f => ({ ...f, sr_number: e.target.value }))} placeholder="SR-001" />
          </div>
          <TextareaInput label="Remarks" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Assigning...' : 'Assign Parking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Edit Parking Record" size="large">
        <form onSubmit={handleUpdate} className="space-y-5">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}

          {/* Read-only summary */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Employee</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{editing?.employee_id?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Car Plate</p>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{editing?.car_plate_number || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Type</p>
              <p className="mt-0.5"><StatusBadge status={editing?.parking_type} /></p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Company</p>
              <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{editing?.tenant_id?.company_name || '—'}</p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput
              label="Badge ID"
              type="number"
              value={editing?.editBadgeId ?? editing?.badge_id ?? ''}
              onChange={e => setEditing(v => ({ ...v, editBadgeId: e.target.value }))}
              placeholder={editing?.badge_id || 'e.g. 1001'}
            />
            <TextInput
              label="Sticker Number"
              value={editing?.editStickerNumber ?? editing?.sticker_number ?? ''}
              onChange={e => setEditing(v => ({ ...v, editStickerNumber: e.target.value }))}
              placeholder={editing?.sticker_number || 'STK-001'}
            />
            <TextInput
              label="SR Number"
              value={editing?.editSrNumber ?? editing?.sr_number ?? ''}
              onChange={e => setEditing(v => ({ ...v, editSrNumber: e.target.value }))}
              placeholder={editing?.sr_number || 'SR-001'}
            />
          </div>

          {editing?.parking_type === 'ASSIGNED' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-blue-500/10 border border-blue-100 dark:border-slate-800/20">
              <TextInput
                label="Slot Code"
                value={editing?.editSlotCode ?? editing?.assigned_slot?.slot_code ?? ''}
                onChange={e => setEditing(v => ({ ...v, editSlotCode: e.target.value }))}
                placeholder={editing?.assigned_slot?.slot_code || 'A-01'}
              />
              <TextInput
                label="Floor Number"
                value={editing?.editFloorNumber ?? editing?.assigned_slot?.floor_number ?? ''}
                onChange={e => setEditing(v => ({ ...v, editFloorNumber: e.target.value }))}
                placeholder={editing?.assigned_slot?.floor_number || '1'}
              />
            </div>
          )}

          <TextareaInput
            label="Remarks"
            value={editing?.editRemarks ?? editing?.remarks ?? ''}
            onChange={e => setEditing(v => ({ ...v, editRemarks: e.target.value }))}
            placeholder="Optional notes..."
          />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-slate-900 hover:bg-black disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={modal === 'cancel'} onClose={() => setModal(null)} title="Cancel Parking Record">
        <form onSubmit={handleCancel} className="space-y-4">
          {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
          <Alert type="warning" message={`Cancel parking for ${editing?.employee_id?.full_name} — plate ${editing?.car_plate_number}?`} />
          <TextareaInput label="Remarks" value={cancelForm.remarks} onChange={e => setCancelForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Reason for cancellation..." />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 rounded-xl transition-colors">Back</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
              {submitting ? 'Cancelling...' : 'Cancel Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
