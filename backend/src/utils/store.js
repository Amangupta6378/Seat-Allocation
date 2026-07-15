const { randomUUID } = require('crypto');

let state = {
  employees: [],
  projects: [],
  seats: []
};

function initializeData() {
  if (state.projects.length > 0 || state.employees.length > 0 || state.seats.length > 0) {
    return state;
  }

  const projects = [
    'Indigo',
    'Indreed',
    'Mydreed',
    'Preed',
    'Serfy',
    'Oreed',
    'bedegreed',
    'Opreed',
    'Serry',
    'Kaary',
    'Mered'
  ].map((name) => ({ id: randomUUID(), name, status: 'Active' }));

  const employees = [
    { id: randomUUID(), employeeCode: 'EMP001', name: 'Aman Kumar', email: 'aman@example.com', department: 'Engineering', role: 'Lead', joiningDate: '2022-01-10', employmentStatus: 'Active', project: 'Indigo', seatAllocationStatus: 'Allocated' },
    { id: randomUUID(), employeeCode: 'EMP002', name: 'Nisha Rao', email: 'nisha@example.com', department: 'Operations', role: 'Manager', joiningDate: '2021-06-12', employmentStatus: 'Active', project: 'Mydreed', seatAllocationStatus: 'Allocated' },
    { id: randomUUID(), employeeCode: 'EMP003', name: 'Ravi Shah', email: 'ravi@example.com', department: 'Product', role: 'Analyst', joiningDate: '2023-04-16', employmentStatus: 'Active', project: 'Serfy', seatAllocationStatus: 'Pending' }
  ];

  const seats = [];
  const floors = [1, 2, 3, 4, 5];
  const zones = ['A', 'B', 'C', 'D'];
  let seatNumber = 1;

  floors.forEach((floor) => {
    zones.forEach((zone) => {
      for (let bay = 1; bay <= 3; bay += 1) {
        seats.push({
          id: randomUUID(),
          floor,
          zone,
          bay,
          seatNumber: seatNumber++,
          status: 'Available',
          allocatedEmployee: null,
          allocatedProject: null,
          allocationDate: null
        });
      }
    });
  });

  state = { employees, projects, seats };
  return state;
}

function getState() {
  return state;
}

function saveEmployee(employee) {
  state.employees.push(employee);
  return employee;
}

function updateEmployee(id, updates) {
  state.employees = state.employees.map((employee) => (employee.id === id ? { ...employee, ...updates } : employee));
  return state.employees.find((employee) => employee.id === id);
}

function deleteEmployee(id) {
  state.employees = state.employees.filter((employee) => employee.id !== id);
}

function saveProject(project) {
  state.projects.push(project);
  return project;
}

function saveSeat(seat) {
  state.seats.push(seat);
  return seat;
}

function updateSeat(id, updates) {
  state.seats = state.seats.map((seat) => (seat.id === id ? { ...seat, ...updates } : seat));
  return state.seats.find((seat) => seat.id === id);
}

module.exports = {
  initializeData,
  getState,
  saveEmployee,
  updateEmployee,
  deleteEmployee,
  saveProject,
  saveSeat,
  updateSeat
};
