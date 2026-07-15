const { connectToDatabase } = require('../config/db');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');
const User = require('../models/User');

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

  const projectNames = [
    'Talos', 'Astra', 'Nova', 'Helix', 'Orbit', 'Vertex', 'Solace', 'Pulse', 'Atlas', 'Flux'
  ];

  const projects = await Project.insertMany(projectNames.map((name) => ({ name, status: 'Active' })));

  // Weighted project distribution to create varied project sizes
  const projectWeights = [0.18, 0.12, 0.09, 0.08, 0.11, 0.06, 0.10, 0.07, 0.10, 0.09];
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

  const floors = [1, 2, 3, 4, 5, 6];
  const zones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seats = [];
  const seatStatusPattern = ['Available', 'Available', 'Available', 'Available', 'Available', 'Reserved', 'Reserved', 'Occupied'];

  for (const floor of floors) {
    for (const zone of zones) {
      for (let bay = 1; bay <= 10; bay += 1) {
        for (let seatIndex = 1; seatIndex <= 11; seatIndex += 1) {
          const seatNumber = (bay - 1) * 11 + seatIndex;
          const status = seatStatusPattern[(floor + zone.length + bay + seatIndex) % seatStatusPattern.length];
          seats.push({ floor, zone, bay, seatNumber, status });
        }
      }
    }
  }

  console.log('Inserting seats...');
  await Seat.insertMany(seats);

  // Leave all seats available so employees can be assigned manually from the UI.
  const createdEmployees = await Employee.find().sort({ createdAt: 1 }).exec();
  await Employee.updateMany({}, { $set: { seatAllocationStatus: 'Pending' } });
  await Seat.updateMany({}, { $set: { status: 'Available', allocatedEmployee: null, allocatedEmployeeId: null, allocatedProject: null, allocationDate: null } });

  if (createdEmployees.length) {
    console.log(`Prepared ${createdEmployees.length} employees for manual seat allocation.`);
  }

  // Create or update admin user
  const existingAdmin = await User.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    existingAdmin.name = 'Admin User';
    existingAdmin.role = 'admin';
    existingAdmin.password = 'admin123';
    await existingAdmin.save();
  } else {
    await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' });
  }

  console.log(`Seeded ${employeeEntries.length} employees and ${seats.length} seats`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
