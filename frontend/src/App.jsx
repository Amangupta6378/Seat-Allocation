import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AuthPage from './AuthPage';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [seats, setSeats] = useState([]);
  const [employeeFilters, setEmployeeFilters] = useState({ search: '', project: '', status: '', department: '' });
  const [seatFilters, setSeatFilters] = useState({ floor: '', zone: '', status: '' });

  const api = async (path, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || 'API request failed');
    }
    return data;
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const params = new URLSearchParams();
      if (employeeFilters.search) params.set('search', employeeFilters.search);
      if (employeeFilters.project) params.set('project', employeeFilters.project);
      if (employeeFilters.status) params.set('status', employeeFilters.status);
      if (employeeFilters.department) params.set('department', employeeFilters.department);

      const seatParams = new URLSearchParams();
      if (seatFilters.floor) seatParams.set('floor', seatFilters.floor);
      if (seatFilters.zone) seatParams.set('zone', seatFilters.zone);
      if (seatFilters.status) seatParams.set('status', seatFilters.status);

      try {
        const [summaryData, projectsData, employeesData, seatsData] = await Promise.all([
          api('/dashboard/summary'),
          api(`/projects`),
          api(`/employees?${params.toString()}`),
          api(`/seats?${seatParams.toString()}`)
        ]);
        setSummary(summaryData);
        setProjects(projectsData);
        setEmployees(employeesData);
        setSeats(seatsData);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      }
    };

    loadData();
  }, [user, employeeFilters, seatFilters]);

  if (!user) {
    return <AuthPage onAuth={(userData) => { localStorage.setItem('user', JSON.stringify(userData)); setUser(userData); }} />;
  }

  const refreshEmployees = async () => {
    const params = new URLSearchParams();
    if (employeeFilters.search) params.set('search', employeeFilters.search);
    if (employeeFilters.project) params.set('project', employeeFilters.project);
    if (employeeFilters.status) params.set('status', employeeFilters.status);
    if (employeeFilters.department) params.set('department', employeeFilters.department);
    const employeesData = await api(`/employees?${params.toString()}`);
    setEmployees(employeesData);
  };

  const handleAllocateSeat = async (employeeId) => {
    try {
      await api(`/employees/${employeeId}/allocate`, { method: 'POST' });
      await refreshEmployees();
    } catch (error) {
      console.error('Allocation failed', error);
      alert(error.message || 'Seat allocation failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ee] text-slate-800">
      <nav className="border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Ethara Seat Allocation</h1>
            <p className="text-sm text-slate-500">Workspace planning for 5,000 employees</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50" to="/">Dashboard</Link>
            <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50" to="/employees">Employees</Link>
            <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50" to="/seats">Seats</Link>
            <Link className="rounded border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50" to="/ai">AI Assistant</Link>
            <button className="rounded bg-rose-600 px-3 py-2 text-white" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Dashboard summary={summary} projects={projects} employees={employees} />} />
          <Route path="/employees" element={<EmployeePage employees={employees} filters={employeeFilters} onFilterChange={setEmployeeFilters} onAllocate={handleAllocateSeat} />} />
          <Route path="/seats" element={<SeatPage seats={seats} filters={seatFilters} onFilterChange={setSeatFilters} />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard({ summary, projects, employees }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary && (
          <>
            <StatCard title="Total Employees" value={summary.totalEmployees} />
            <StatCard title="Total Seats" value={summary.totalSeats} />
            <StatCard title="Occupied" value={summary.occupiedSeats} />
            <StatCard title="Available" value={summary.availableSeats} />
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Project Utilization</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects.map((project, index) => ({ name: project.name, employees: employees.filter((employee) => employee.project === project.name).length, fill: ['#2563eb', '#0f766e', '#7c3aed', '#dc2626', '#ea580c', '#16a34a', '#0891b2', '#9333ea', '#e11d48', '#4f46e5'][index % 10] }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="employees" fill={(entry) => entry.fill} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Seat Overview</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"><span>Reserved Seats</span><span className="font-semibold text-slate-900">{summary?.reservedSeats ?? 0}</span></li>
            <li className="flex justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"><span>Pending Allocation</span><span className="font-semibold text-slate-900">{summary?.pendingAllocation ?? 0}</span></li>
            <li className="flex justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"><span>Active Projects</span><span className="font-semibold text-slate-900">{projects.length}</span></li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmployeePage({ employees, filters, onFilterChange, onAllocate }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Employees</h2>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input value={filters.search} onChange={(event) => onFilterChange({ ...filters, search: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Search by name, email, ID" />
        <input value={filters.project} onChange={(event) => onFilterChange({ ...filters, project: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Project" />
        <input value={filters.department} onChange={(event) => onFilterChange({ ...filters, department: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Department" />
        <input value={filters.status} onChange={(event) => onFilterChange({ ...filters, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Employment status" />
      </div>
      <div className="space-y-3">
        {employees.map((employee, index) => {
          const seatLabel = employee.seat ? `Floor ${employee.seat.floor}, Zone ${employee.seat.zone}, Bay ${employee.seat.bay}, Seat ${employee.seat.zone}${employee.seat.bay}-${employee.seat.seatNumber}` : 'No active seat assigned';
          const badgeTone = employee.seatAllocationStatus === 'Allocated' ? 'bg-emerald-50 text-emerald-700' : employee.seatAllocationStatus === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700';
          const canAllocate = employee.seatAllocationStatus !== 'Allocated';

          return (
            <div key={index} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{employee.name}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeTone}`}>{employee.seatAllocationStatus || 'Pending'}</span>
                  </div>
                  <p className="text-sm text-slate-600">{employee.employeeCode} • {employee.email}</p>
                  <p className="text-sm text-slate-600">Project: {employee.project} • Department: {employee.department}</p>
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{seatLabel}</div>
                  {canAllocate && (
                    <button onClick={() => onAllocate(employee._id)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                      Allocate seat
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeatPage({ seats, filters, onFilterChange }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Seats</h2>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input value={filters.floor} onChange={(event) => onFilterChange({ ...filters, floor: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Floor" />
        <input value={filters.zone} onChange={(event) => onFilterChange({ ...filters, zone: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Zone" />
        <input value={filters.status} onChange={(event) => onFilterChange({ ...filters, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" placeholder="Seat status" />
      </div>
      <div className="space-y-3">
        {seats.map((seat, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-900">Floor {seat.floor} • Zone {seat.zone} • Bay {seat.bay} • Seat {seat.zone}{seat.bay}-{seat.seatNumber}</p>
            <p className="mt-1 text-sm text-slate-600">Status: {seat.status} • Assigned to: {seat.allocatedEmployee || 'Unassigned'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('Ask about your seat, project, or available seats.');

  async function handleSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const result = await fetch('/api/ai/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query, email: JSON.parse(localStorage.getItem('user') || '{}').email || '' })
    }).then((res) => res.json());
    setResponse(result.result);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">AI Assistant</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Try: Where is my seat?" />
        <button className="rounded-2xl bg-slate-900 px-4 py-2 text-white" type="submit">Ask</button>
      </form>
      <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700">{response}</p>
    </div>
  );
}

export default App;
