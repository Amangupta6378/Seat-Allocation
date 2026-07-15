const { connectToDatabase, disconnectFromDatabase } = require('../config/db');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');

(async function () {
  try {
    await connectToDatabase();
    const total = await Employee.countDocuments();
    const allocated = await Employee.countDocuments({ seatAllocationStatus: 'Allocated' });
    const pending = await Employee.countDocuments({ seatAllocationStatus: 'Pending' });
    const unassigned = await Employee.countDocuments({ seatAllocationStatus: 'Unassigned' });
    const seatCount = await Seat.countDocuments();
    const occupiedSeats = await Seat.countDocuments({ status: 'Occupied' });
    const availableSeats = await Seat.countDocuments({ status: 'Available' });
    const reservedSeats = await Seat.countDocuments({ status: 'Reserved' });

    console.log(JSON.stringify({ total, allocated, pending, unassigned, seatCount, occupiedSeats, availableSeats, reservedSeats }, null, 2));

    await disconnectFromDatabase();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
