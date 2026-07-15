const { connectToDatabase } = require('../config/db');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');
const User = require('../models/User');

async function seedLargeData() {
  await connectToDatabase();
  await Promise.all([Project.deleteMany({}), Employee.deleteMany({}), Seat.deleteMany({}), User.deleteMany({})]);

  const projects = [
    'Indigo', 'Indreed', 'Mydreed', 'Preed', 'Serfy', 'Oreed', 'bedegreed', 'Opreed', 'Serry', 'Kaary', 'Mered'
  ];
  const createdProjects = await Project.insertMany(projects.map((name) => ({ name, status: 'Active' })));

  const floors = [1, 2, 3, 4, 5];
  const zones = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seats = [];
  let seatNumber = 1;
  for (const floor of floors) {
    for (const zone of zones) {
      for (let bay = 1; bay <= 5; bay += 1) {
        seats.push({ floor, zone, bay, seatNumber: seatNumber++, status: 'Available' });
      }
    }
  }
  const createdSeats = await Seat.insertMany(seats);

  const employeesToCreate = [];
  for (let index = 1; index <= 5000; index += 1) {
    const project = createdProjects[index % createdProjects.length].name;
    employeesToCreate.push({
      employeeCode: `EMP${String(index).padStart(5, '0')}`,
      name: `Employee ${index}`,
      email: `employee${index}@ethara.ai`,
      department: ['Engineering', 'HR', 'Operations', 'Product', 'Finance'][index % 5],
      role: ['Engineer', 'Manager', 'Analyst', 'Lead', 'Admin'][index % 5],
      joiningDate: '2024-01-01',
      employmentStatus: index % 17 === 0 ? 'Inactive' : 'Active',
      project,
      seatAllocationStatus: index <= 4500 ? 'Allocated' : 'Pending'
    });
  }
  await Employee.insertMany(employeesToCreate);

  await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' });

  const availableSeats = createdSeats.slice(0, 500);
  const reservedSeats = createdSeats.slice(500, 600);

  for (let index = 0; index < 500; index += 1) {
    const seat = availableSeats[index];
    await Seat.findByIdAndUpdate(seat._id, { status: 'Available' });
  }
  for (let index = 0; index < 100; index += 1) {
    const seat = reservedSeats[index];
    await Seat.findByIdAndUpdate(seat._id, { status: 'Reserved' });
  }

  console.log('Seeded 5000 employees, 5500 seats, and related users.');
  process.exit(0);
}

seedLargeData().catch((error) => {
  console.error(error);
  process.exit(1);
});
