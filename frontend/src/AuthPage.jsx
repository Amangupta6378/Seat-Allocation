import { useState } from 'react';
import { apiRequest } from './lib/api';
import { DEPARTMENTS, PROJECT_NAMES, ROLES } from './constants';

export default function AuthPage({ onAuth }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      localStorage.setItem('token', data.token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 25%, #7c3aed 50%, #8b5cf6 75%, #a78bfa 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl animate-pulse-slow delay-300"></div>
      </div>

      <div className="relative w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 shadow-lg">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Ethara</h1>
          <p className="text-indigo-200 mt-1 text-sm font-light">Seat Allocation & Project Mapping</p>
        </div>

        <div className="glass-white rounded-3xl p-8 shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email</label>
              <input id="auth-email-login" type="email" className="input-premium" placeholder="admin@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
              <input id="auth-password" type="password" className="input-premium" placeholder="••••••••" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600 animate-slideUp" id="auth-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button id="auth-submit" type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base font-semibold mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Sign in to access the dashboard and allocation tools.
          </p>
        </div>

        <p className="text-center text-xs text-indigo-300/60 mt-6">
          © 2026 Ethara. Workspace planning for 5,000+ employees.
        </p>
      </div>
    </div>
  );
}