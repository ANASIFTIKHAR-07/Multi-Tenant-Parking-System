import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { changePassword } from '../../services/authApi.js';
import Alert from '../../Components/common/Alert.jsx';

function PasswordInput({ id, label, value, show, onToggle, onChange, placeholder, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={id} name={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-900 placeholder-slate-400 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
        <button
          type="button" tabIndex={-1} onClick={onToggle}
          className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
        >
          {show ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function getStrength(pw) {
  return (
    (pw.length >= 6 ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0)
  );
}

const STRENGTH_META = [
  null,
  { label: 'Weak',   bar: 'bg-red-400',    text: 'text-red-500'    },
  { label: 'Fair',   bar: 'bg-orange-400', text: 'text-orange-500' },
  { label: 'Good',   bar: 'bg-yellow-400', text: 'text-yellow-600' },
  { label: 'Strong', bar: 'bg-emerald-500',text: 'text-emerald-600'},
];

export default function Profile() {
  const { admin } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setError(e.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getStrength(form.newPassword);
  const meta = STRENGTH_META[strength];

  const memberSince = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const infoRows = [
    { label: 'Full Name',    value: admin?.name || '—',  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Email',        value: admin?.email || '—', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', mono: true },
    { label: 'Role',         value: admin?.role ? admin.role.charAt(0).toUpperCase() + admin.role.slice(1) : 'Admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Member Since', value: memberSince,          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  const requirements = [
    { label: 'At least 6 characters',     met: form.newPassword.length >= 6 },
    { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(form.newPassword) },
    { label: 'One number (0–9)',           met: /[0-9]/.test(form.newPassword) },
    { label: 'One special character',      met: /[^A-Za-z0-9]/.test(form.newPassword) },
  ];

  return (
    <div className="pb-8">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-[20px] font-bold text-slate-900">Account Profile</h1>
        <p className="text-[13px] text-slate-400 mt-1">Manage your personal information and account security</p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* ── LEFT: Identity card ── */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm h-full flex flex-col">
          {/* Banner — overflow-hidden only on the banner, not the card */}
          <div className="h-24 rounded-t-2xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e4080 50%, #163366 100%)' }}
          >
            {/* Grid texture */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="pg" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pg)" />
            </svg>
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full border border-white/10" />
            <div className="absolute right-5 top-5 w-14 h-14 rounded-full border border-white/[0.06]" />
          </div>

          <div className="px-6 pb-6 flex flex-col flex-1">
            {/* Avatar — sits outside overflow-hidden, so it renders correctly */}
            <div className="relative -mt-7 mb-4 w-fit">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center ring-[3px] ring-white shadow-lg shadow-blue-600/25"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
              >
                <span className="text-white text-[22px] font-bold leading-none">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
            </div>

            {/* Name / email / badge */}
            <div className="mb-5">
              <p className="text-[17px] font-bold text-slate-900">{admin?.name || 'Admin'}</p>
              <p className="text-[13px] text-slate-400 mt-0.5">{admin?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[11px] font-semibold text-blue-700 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {(admin?.role || 'ADMIN').toUpperCase()}
              </span>
            </div>

            <div className="h-px bg-slate-100 mb-4" />

            {/* Info rows */}
            <div className="space-y-0.5 flex-1">
              {infoRows.map(({ label, value, icon, mono }) => (
                <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={icon} />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className={`text-[13px] font-medium text-slate-800 truncate mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Change password ── */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden h-full flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800">Change Password</p>
              <p className="text-[12px] text-slate-400 mt-0.5">Keep your account secure with a strong password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4 flex-1">
            {error   && <Alert type="error"   message={error}   onDismiss={() => setError('')}   />}
            {success && <Alert type="success" message={success} onDismiss={() => setSuccess('')} />}

            <PasswordInput
              id="currentPassword" label="Current Password"
              value={form.currentPassword} show={show.current}
              onToggle={() => setShow(s => ({ ...s, current: !s.current }))}
              onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />

            <PasswordInput
              id="newPassword" label="New Password"
              value={form.newPassword} show={show.new}
              onToggle={() => setShow(s => ({ ...s, new: !s.new }))}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />

            {/* Strength meter */}
            {form.newPassword && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${i <= strength ? meta?.bar : 'bg-slate-100'}`} />
                  ))}
                </div>
                <p className="text-[11.5px] text-slate-400">
                  Strength: <span className={`font-semibold ${meta?.text}`}>{meta?.label}</span>
                  <span className="ml-2 text-slate-300">· Use uppercase, numbers &amp; symbols</span>
                </p>
              </div>
            )}

            <PasswordInput
              id="confirmPassword" label="Confirm New Password"
              value={form.confirmPassword} show={show.confirm}
              onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />

            {/* Match indicator */}
            {form.confirmPassword && (
              <p className={`text-[12px] font-medium flex items-center gap-1.5 ${form.newPassword === form.confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                {form.newPassword === form.confirmPassword ? (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Passwords match</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>Passwords do not match</>
                )}
              </p>
            )}

            {/* Requirements checklist */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 space-y-2">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Password requirements</p>
              {requirements.map(({ label, met }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${met ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    {met && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[12.5px] transition-colors duration-200 ${met ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{label}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13.5px] font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
