const { connectToDatabase } = require('../config/db');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');
const User = require('../models/User');
const { PROJECT_NAMES, SEAT_LAYOUT } = require('../utils/constants');

async function seed() {
  console.log('Connecting to database...');
  await connectToDatabase();

  console.log('Clearing collections...');
  await Promise.all([
    Project.deleteMany({}),
    Employee.deleteMany({}),
    Seat.deleteMany({}),
    User.deleteMany({})
  ]);

  const projects = await Project.insertMany(PROJECT_NAMES.map((name) => ({ name, status: 'Active' })));

  // Weighted project distribution to create varied project sizes
  const projectWeights = [0.16, 0.10, 0.10, 0.08, 0.10, 0.08, 0.08, 0.08, 0.08, 0.08, 0.06];
  function pickProject() {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < projects.length; i += 1) {
      acc += projectWeights[i];
      if (r <= acc) return projects[i].name;
    }
    return projects[projects.length - 1].name;
  }

  const departments = ['Engineering', 'Operations', 'Product', 'Finance', 'HR', 'Support'];
  const roles = ['Engineer', 'Manager', 'Analyst', 'Lead', 'Director', 'Specialist'];
  const employeeEntries = [];

  for (let i = 1; i <= 5000; i += 1) {
    const project = pickProject();
    const department = departments[i % departments.length];
    const role = roles[i % roles.length];
    const status = i <= 4500 ? 'Active' : 'Inactive';
    const seatAllocationStatus = 'Pending';
    employeeEntries.push({
      employeeCode: `EMP${String(i).padStart(4, '0')}`,
      name: `Employee ${i}`,
      email: `employee${i}@example.com`,
      department,
      role,
      joiningDate: '2024-01-01',
      employmentStatus: status,
      project,
      seatAllocationStatus
    });
  }

  console.log('Inserting employees...');
  await Employee.insertMany(employeeEntries);

  const seats = [];
  const seatStatusPattern = ['Available', 'Available', 'Available', 'Available', 'Available', 'Reserved', 'Occupied', 'Available'];

  for (const floor of SEAT_LAYOUT.floors) {
    for (const zone of SEAT_LAYOUT.zones) {
      for (let bay = 1; bay <= SEAT_LAYOUT.baysPerZone; bay += 1) {
        for (let seatIndex = 1; seatIndex <= SEAT_LAYOUT.seatsPerBay; seatIndex += 1) {
          const seatNumber = (bay - 1) * SEAT_LAYOUT.seatsPerBay + seatIndex;
          const status = seatStatusPattern[(floor + zone.charCodeAt(0) + bay + seatIndex) % seatStatusPattern.length];
          seats.push({ floor, zone, bay, seatNumber, status });
        }
      }
    }
  }

  console.log('Inserting seats...');
  await Seat.insertMany(seats);

  const createdEmployees = await Employee.find().sort({ createdAt: 1 }).exec();
  await Employee.updateMany({}, { $set: { seatAllocationStatus: 'Pending' } });
  await Seat.updateMany({}, { $set: { status: 'Available', allocatedEmployee: null, allocatedEmployeeId: null, allocatedProject: null, allocationDate: null } });

  if (createdEmployees.length) {
    console.log(`Prepared ${createdEmployees.length} employees for manual seat allocation.`);
  }

  // Create or update admin user
  await User.deleteMany({ role: { $nin: ['admin', 'hr'] } });

  const admin = await User.findOne({ username: 'admin' });
  if (admin) {
    admin.name = 'Admin User';
    admin.role = 'admin';
    admin.password = 'admin123';
    admin.email = 'admin@example.com';
    await admin.save();
  } else {
    await User.create({ username: 'admin', name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' });
  }

  const hr = await User.findOne({ username: 'hr' });
  if (hr) {
    hr.name = 'HR User';
    hr.role = 'hr';
    hr.password = 'hr1234';
    hr.email = 'hr@example.com';
    await hr.save();
  } else {
    await User.create({ username: 'hr', name: 'HR User', email: 'hr@example.com', password: 'hr1234', role: 'hr' });
  }

  console.log(`Seeded ${employeeEntries.length} employees and ${seats.length} seats`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
