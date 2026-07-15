const { connectToDatabase, disconnectFromDatabase } = require('../config/db');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');

(async function(){
  await connectToDatabase();
  const occupiedWithoutEmployee = await Seat.countDocuments({ status: 'Occupied', allocatedEmployee: null });
  const occupiedWithUnknown = await Seat.countDocuments({ status: 'Occupied', allocatedEmployee: { $nin: (await Employee.find().distinct('name')) } });
  const allocatedEmployees = await Employee.countDocuments({ seatAllocationStatus: 'Allocated' });
  console.log({ occupiedWithoutEmployee, occupiedWithUnknown, allocatedEmployees });
  await disconnectFromDatabase();
})();
