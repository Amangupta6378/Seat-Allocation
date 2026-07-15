const express = require('express');
const router = express.Router();
const Seat = require('../models/Seat');
const Employee = require('../models/Employee');
const { findBestSeat, buildSeatSuggestionMessage } = require('../utils/allocation');

router.get('/', async (req, res) => {
  const { floor, zone, status } = req.query;
  const filter = {};
  if (floor) filter.floor = Number(floor);
  if (zone) filter.zone = zone;
  if (status) filter.status = status;
  const seats = await Seat.find(filter).sort({ floor: 1, zone: 1, seatNumber: 1 });
  res.json(seats);
});

router.get('/available', async (req, res) => {
  const { floor, zone } = req.query;
  const filter = { status: 'Available' };
  if (floor) filter.floor = Number(floor);
  if (zone) filter.zone = zone;
  const seats = await Seat.find(filter).sort({ floor: 1, zone: 1, seatNumber: 1 });
  res.json(seats);
});

router.post('/', async (req, res) => {
  try {
    const seat = await Seat.create(req.body);
    res.status(201).json(seat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/allocate', async (req, res) => {
  const { employeeId, seatId, preferredZone } = req.body;
  const employee = await Employee.findById(employeeId);
  const seat = await Seat.findById(seatId);

  if (!employee || !seat) return res.status(404).json({ error: 'Employee or seat not found' });
  if (seat.status !== 'Available') {
    const alternatives = await Seat.find({ status: 'Available', floor: seat.floor }).sort({ zone: 1, seatNumber: 1 });
    const suggested = findBestSeat(alternatives, preferredZone || null);
    return res.status(409).json({ error: 'Seat is not available', suggestion: buildSeatSuggestionMessage(suggested, preferredZone || null) });
  }

  const updatedSeat = await Seat.findByIdAndUpdate(seatId, {
    status: 'Occupied',
    allocatedEmployee: employee.name,
    allocatedEmployeeId: employee._id,
    allocatedProject: employee.project,
    allocationDate: new Date()
  }, { new: true });
  await Employee.findByIdAndUpdate(employeeId, { seatAllocationStatus: 'Allocated' });

  res.json({ seat: updatedSeat, suggestion: buildSeatSuggestionMessage(updatedSeat, preferredZone || null) });
});

router.post('/release', async (req, res) => {
  const seat = await Seat.findByIdAndUpdate(req.body.seatId, {
    status: 'Available',
    allocatedEmployee: null,
    allocatedProject: null,
    allocationDate: null
  }, { new: true });
  if (!seat) return res.status(404).json({ error: 'Seat not found' });
  res.json(seat);
});

// Bulk allocation: assign available seats to employees without allocation
router.post('/allocate-bulk', async (req, res) => {
  const employees = await Employee.find({ employmentStatus: 'Active', seatAllocationStatus: { $ne: 'Allocated' } }).sort({ createdAt: 1 });
  const seats = await Seat.find({ status: 'Available' }).sort({ floor: 1, zone: 1, bay: 1, seatNumber: 1 });
  const allAllocated = [];

  for (const emp of employees) {
    if (seats.length === 0) break;
    // prefer zone where teammates sit
    const teammates = await Employee.find({ project: emp.project, seatAllocationStatus: 'Allocated' });
    const teammateZones = teammates.map((t) => seats.find((s) => s.allocatedEmployee === t.name)?.zone).filter(Boolean);
    let preferredZone = null;
    if (teammateZones.length) {
      preferredZone = teammateZones.reduce((a, b) => (teammateZones.filter(x => x === a).length >= teammateZones.filter(x => x === b).length ? a : b));
    }

    let idx = preferredZone ? seats.findIndex((s) => s.zone === preferredZone) : 0;
    if (idx === -1) idx = 0;
    const seat = seats.splice(idx, 1)[0];
    await Seat.findByIdAndUpdate(seat._id, { status: 'Occupied', allocatedEmployee: emp.name, allocatedEmployeeId: emp._id, allocatedProject: emp.project, allocationDate: new Date() });
    await Employee.findByIdAndUpdate(emp._id, { seatAllocationStatus: 'Allocated' });
    allAllocated.push({ employee: emp.name, seat: `${seat.floor}-${seat.zone}-${seat.bay}-${seat.seatNumber}` });
  }

  res.json({ allocated: allAllocated.length, details: allAllocated });
});

module.exports = router;
