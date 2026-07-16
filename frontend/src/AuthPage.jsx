import { useState } from 'react';
import { apiRequest } from './lib/api';
import { DEPARTMENTS, PROJECT_NAMES, ROLES } from './constants';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: '',
    employeeCode: '',
    name: '',
    email: '',
    password: '',
    department: '',
    role: '',
    joiningDate: '',
    project: '',
    employmentStatus: 'Active',
    seatAllocationStatus: 'Pending'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isLogin = mode === 'login';
      if (!isLogin && !localStorage.getItem('token')) {
        setError('Sign in first to add employees.');
        return;
      }

      const payload = isLogin
        ? { email: form.email, password: form.password }
        : {
            employeeCode: form.employeeCode,
            name: form.name,
            email: form.email,
            department: form.department,
            role: form.role,
            joiningDate: form.joiningDate,
            employmentStatus: form.employmentStatus,
            project: form.project,
            seatAllocationStatus: form.seatAllocationStatus
          };

      const headers = {};
      const token = localStorage.getItem('token');
      if (!isLogin && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const data = await apiRequest(isLogin ? '/auth/login' : '/employees', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (isLogin) {
        localStorage.setItem('token', data.token);
        onAuth(data.user);
      } else {
        setError(`Employee ${data.name} created successfully.`);
        setForm({
          username: '',
          employeeCode: '',
          name: '',
          email: '',
          password: '',
          department: '',
          role: '',
          joiningDate: '',
          project: '',
          employmentStatus: 'Active',
          seatAllocationStatus: 'Pending'
        });
      }
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
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              id="auth-login-tab"
              type="button"
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              id="auth-signup-tab"
              type="button"
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Add Employee
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="space-y-4 animate-slideUp">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Username</label>
                  <input id="signup-username" className="input-premium" placeholder="admin" value={form.username} onChange={(e) => updateField('username', e.target.value)} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Employee ID</label>
                  <input id="signup-employee-code" className="input-premium" placeholder="EMP5001" value={form.employeeCode} onChange={(e) => updateField('employeeCode', e.target.value)} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input id="signup-name" className="input-premium" placeholder="John Doe" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Department</label>
                  <select id="signup-department" className="select-premium" value={form.department} onChange={(e) => updateField('department', e.target.value)} required>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Role</label>
                  <select id="signup-role" className="select-premium" value={form.role} onChange={(e) => updateField('role', e.target.value)} required>
                    <option value="">Select role</option>
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Project</label>
                  <select id="signup-project" className="select-premium" value={form.project} onChange={(e) => updateField('project', e.target.value)} required>
                    <option value="">Select project</option>
                    {PROJECT_NAMES.map((project) => <option key={project} value={project}>{project}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Joining Date</label>
                  <input id="signup-date" type="date" className="input-premium" value={form.joiningDate} onChange={(e) => updateField('joiningDate', e.target.value)} required />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Employment Status</label>
                  <select id="signup-employment-status" className="select-premium" value={form.employmentStatus} onChange={(e) => updateField('employmentStatus', e.target.value)} required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Seat Allocation Status</label>
                  <select id="signup-seat-allocation-status" className="select-premium" value={form.seatAllocationStatus} onChange={(e) => updateField('seatAllocationStatus', e.target.value)} required>
                    <option value="Pending">Pending</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Not Required">Not Required</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email</label>
              <input id="auth-email-login" type="email" className="input-premium" placeholder="admin@example.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </div>

            {mode === 'login' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
                <input id="auth-password" type="password" className="input-premium" placeholder="••••••••" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email</label>
                <input id="auth-email" type="email" className="input-premium" placeholder="you@ethara.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
              </div>
            )}

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
                  {mode === 'login' ? 'Signing in…' : 'Saving employee…'}
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Add Employee'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            {mode === 'login'
              ? 'Sign in to access the dashboard and allocation tools.'
              : 'Create employee records from the admin or HR workflow.'}
          </p>
        </div>

        <p className="text-center text-xs text-indigo-300/60 mt-6">
          © 2026 Ethara. Workspace planning for 5,000+ employees.
        </p>
      </div>
    </div>
  );
}