import { useState } from 'react';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', role: '', joiningDate: '', project: '' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const payload = mode === 'login'
      ? { email: form.email, password: form.password }
      : form;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Authentication failed');
      return;
    }
    localStorage.setItem('token', data.token);
    onAuth(data.user);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f4ee] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Ethara Access</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in or create an account to manage seat allocation.</p>
        <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
          <button className={`flex-1 rounded-xl px-3 py-2 text-sm ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`} onClick={() => setMode('login')}>Login</button>
          <button className={`flex-1 rounded-xl px-3 py-2 text-sm ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`} onClick={() => setMode('signup')}>Signup</button>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <input className="w-full text-black rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input className="w-full text-black rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
              <input className="w-full text-black rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} />
              <input className="w-full text-black rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Project" value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value })} />
              <input className="w-full text-black rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" type="date" placeholder="Joining date" value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} />
            </>
          )}
          <input className="w-full text-black rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="w-full text-black rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button className="w-full rounded-2xl bg-slate-900 px-4 py-2 font-medium text-white" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
      </div>
    </div>
  );
}
