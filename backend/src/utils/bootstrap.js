const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');
const User = require('../models/User');
const { PROJECT_NAMES, SEAT_LAYOUT } = require('./constants');

async function saveOrCreateUser(filter, data) {
  const existing = await User.findOne(filter);
  if (existing) {
    existing.username = data.username;
    existing.name = data.name;
    existing.email = data.email;
    existing.password = data.password;
    existing.role = data.role;
    await existing.save();
    return existing;
  }

  return User.create(data);
}

async function ensureBaseData() {
  await Promise.all(PROJECT_NAMES.map(async (name) => {
    const existing = await Project.findOne({ name });
    if (!existing) {
      await Project.create({ name, status: 'Active' });
    }
  }));

  const seatCount = await Seat.countDocuments();
  if (seatCount === 0) {
    const seats = [];
    for (const floor of SEAT_LAYOUT.floors) {
      for (const zone of SEAT_LAYOUT.zones) {
        for (let bay = 1; bay <= SEAT_LAYOUT.baysPerZone; bay += 1) {
          for (let seatNumber = 1; seatNumber <= SEAT_LAYOUT.seatsPerBay; seatNumber += 1) {
            seats.push({
              floor,
              zone,
              bay,
              seatNumber: (bay - 1) * SEAT_LAYOUT.seatsPerBay + seatNumber,
              status: 'Available'
            });
          }
        }
      }
    }

    await Seat.insertMany(seats);
  }

  const employeeCount = await Employee.countDocuments();
  if (employeeCount === 0) {
    const departments = ['Engineering', 'Operations', 'Product', 'Finance', 'Human Resources', 'Support'];
    const roles = ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Product Manager', 'Designer', 'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'Manager', 'Director'];
    const employees = [];

    for (let index = 1; index <= 5000; index += 1) {
      const project = PROJECT_NAMES[(index - 1) % PROJECT_NAMES.length];
      employees.push({
        employeeCode: `EMP${String(index).padStart(4, '0')}`,
        name: `Employee ${index}`,
        email: `employee${index}@example.com`,
        department: departments[(index - 1) % departments.length],
        role: roles[(index - 1) % roles.length],
        joiningDate: '2024-01-01',
        status: 'Active',
        employmentStatus: 'Active',
        project,
        seatAllocationStatus: 'Pending'
      });
    }

    await Employee.insertMany(employees);
  }

  await User.deleteMany({ role: { $nin: ['admin', 'hr'] } });

  await saveOrCreateUser({ username: 'admin' }, {
    username: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });

  await saveOrCreateUser({ username: 'hr' }, {
    username: 'hr',
    name: 'HR User',
    email: 'hr@example.com',
    password: 'hr1234',
    role: 'hr'
  });
}

module.exports = { ensureBaseData };