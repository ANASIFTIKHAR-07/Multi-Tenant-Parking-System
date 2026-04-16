import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slowServer, setSlowServer] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, admin, loading } = useAuth();

  useEffect(() => {
    if (!loading && admin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [admin, loading, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSlowServer(false);
    setSubmitting(true);
    try {
      const adminData = await login(form, () => setSlowServer(true));
      if (adminData) {
        navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true });
      }
    } catch (e) {
      console.error('[Login] error:', e);
      setError(e.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
      setSlowServer(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-grid opacity-60 dark:opacity-20 pointer-events-none" />

      {/* Soft glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-200 dark:bg-slate-800/40 rounded-full opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full opacity-25 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] relative">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 items-center justify-center shadow-lg shadow-slate-900/20 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">ParkAdmin</h1>
          <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">Sign in to your management console</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            {error && (
              <div className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-[13px] text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {slowServer && !error && (
              <div className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <p className="text-[13px] text-amber-700 dark:text-amber-400 font-medium">
                  Server is waking up — this can take up to 30 seconds on first load.
                </p>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[13px] text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/5 outline-none transition-all hover:border-slate-300 dark:hover:border-slate-600 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password" name="password"
                    type={showPass ? 'text' : 'password'} autoComplete="current-password" required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[13px] text-slate-900 dark:text-white placeholder-slate-400 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-900 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/5 outline-none transition-all hover:border-slate-300 dark:hover:border-slate-600 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-black active:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-xl shadow-sm shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {slowServer ? 'Waking up server...' : 'Signing in...'}
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer strip */}
          <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Secure Connection
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              JWT Auth
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Rate Limited
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-5">
          ParkAdmin · Enterprise Parking Management
        </p>
      </div>
    </div>
  );
}
