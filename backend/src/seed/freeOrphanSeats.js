const { connectToDatabase, disconnectFromDatabase } = require('../config/db');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');

(async function(){
  try {
    await connectToDatabase();
    const employeeNames = await Employee.find().distinct('name');
    const result = await Seat.updateMany({ status: 'Occupied', allocatedEmployee: { $nin: employeeNames } }, { $set: { status: 'Available', allocatedEmployee: null, allocatedProject: null, allocationDate: null } });
    console.log('Orphan seats freed:', result.modifiedCount);
    await disconnectFromDatabase();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
