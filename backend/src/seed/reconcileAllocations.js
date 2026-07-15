const { connectToDatabase, disconnectFromDatabase } = require('../config/db');
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');

(async function () {
  try {
    await connectToDatabase();
    const employees = await Employee.find().sort({ createdAt: 1 }).exec();
    const seats = await Seat.find().sort({ floor: 1, zone: 1, bay: 1, seatNumber: 1 }).exec();

    // Map employee name -> seat
    const seatByEmployee = {};
    for (const s of seats) {
      if (s.allocatedEmployee) seatByEmployee[s.allocatedEmployee] = s;
    }

    // Ensure employees with allocated seats have status 'Allocated'
    for (const emp of employees) {
      const seat = seatByEmployee[emp.name];
      if (seat && emp.seatAllocationStatus !== 'Allocated') {
        await Employee.findByIdAndUpdate(emp._id, { seatAllocationStatus: 'Allocated' });
      }
    }

    // For employees marked Allocated but without a seat, assign available seats
    const allocatedButNoSeat = employees.filter((e) => e.seatAllocationStatus === 'Allocated' && !seatByEmployee[e.name]);
    const availableSeats = seats.filter((s) => s.status === 'Available');

    let idx = 0;
    for (const emp of allocatedButNoSeat) {
      if (idx >= availableSeats.length) break;
      const seatToAssign = availableSeats[idx++];
      await Seat.findByIdAndUpdate(seatToAssign._id, { status: 'Occupied', allocatedEmployee: emp.name, allocatedProject: emp.project, allocationDate: new Date() });
      await Employee.findByIdAndUpdate(emp._id, { seatAllocationStatus: 'Allocated' });
    }

    // For remaining unallocated employees, assign seats if available
    const remainingUnallocated = employees.filter((e) => e.seatAllocationStatus !== 'Allocated');
    const freshAvailable = await Seat.find({ status: 'Available' }).sort({ floor: 1, zone: 1, bay: 1, seatNumber: 1 });
    let ai = 0;
    for (const emp of remainingUnallocated) {
      if (ai >= freshAvailable.length) break;
      const seatToAssign = freshAvailable[ai++];
      await Seat.findByIdAndUpdate(seatToAssign._id, { status: 'Occupied', allocatedEmployee: emp.name, allocatedProject: emp.project, allocationDate: new Date() });
      await Employee.findByIdAndUpdate(emp._id, { seatAllocationStatus: 'Allocated' });
    }

    console.log('Reconciliation complete');
    await disconnectFromDatabase();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
