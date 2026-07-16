const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');
const { findBestSeat } = require('../utils/allocation');
const { PROJECT_NAMES } = require('../utils/constants');

router.get('/', async (req, res) => {
  const { search, project, status, department } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { employeeCode: new RegExp(search, 'i') }
    ];
  }
  if (project) filter.project = new RegExp(project, 'i');
  if (status) filter.employmentStatus = new RegExp(status, 'i');
  if (department) filter.department = new RegExp(department, 'i');

  const employees = await Employee.find(filter).sort({ createdAt: -1 });
  const seats = await Seat.find();
  const employeesWithSeats = employees.map((employee) => {
    const seat = seats.find((item) => item.allocatedEmployeeId?.toString() === employee._id.toString()) || seats.find((item) => item.allocatedEmployee === employee.name);
    return {
      ...employee.toObject(),
      seat: seat || null
    };
  });

  res.json(employeesWithSeats);
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const employeeCount = await Employee.countDocuments();
    const projectName = data.project || data.projectName;

    if (!data.name || !data.email || !data.department || !data.role || !data.joiningDate || !projectName) {
      return res.status(400).json({ error: 'Missing required employee fields' });
    }

    if (PROJECT_NAMES.length && !PROJECT_NAMES.includes(projectName)) {
      return res.status(400).json({ error: 'Project is not in the supported project list' });
    }

    const employee = await Employee.create({
      employeeCode: data.employeeCode || `EMP${String(employeeCount + 1).padStart(4, '0')}`,
      name: data.name,
      email: data.email,
      department: data.department,
      role: data.role,
      joiningDate: data.joiningDate,
      status: data.status || 'Active',
      employmentStatus: data.employmentStatus || 'Active',
      projectId: data.projectId || null,
      project: projectName,
      seatAllocationStatus: data.seatAllocationStatus || 'Pending'
    });
    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Employee already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/allocate', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    if (employee.seatAllocationStatus === 'Allocated') {
      const existingSeat = await Seat.findOne({
        $or: [
          { allocatedEmployeeId: employee._id },
          { allocatedEmployee: employee.name }
        ]
      });
      return res.json({ message: 'Employee already has a seat assigned', seat: existingSeat || null });
    }

    const availableSeats = await Seat.find({ status: 'Available' }).sort({ floor: 1, zone: 1, bay: 1, seatNumber: 1 });
    const teammateSeats = await Seat.find({ allocatedProject: employee.project, status: 'Occupied' });
    const seatZones = teammateSeats.map((seat) => seat.zone).filter(Boolean);
    const preferredZone = seatZones.length
      ? seatZones.reduce((a, b) => (seatZones.filter((x) => x === a).length >= seatZones.filter((x) => x === b).length ? a : b))
      : null;
    const seat = findBestSeat(availableSeats, preferredZone, employee.role);

    if (!seat) return res.status(404).json({ error: 'No available seats. Please add more seats or release occupied seats.' });

    const updatedSeat = await Seat.findByIdAndUpdate(seat._id, {
      status: 'Occupied',
      allocatedEmployee: employee.name,
      allocatedEmployeeId: employee._id,
      allocatedProject: employee.project,
      allocationDate: new Date()
    }, { new: true });
    await Employee.findByIdAndUpdate(employee._id, { seatAllocationStatus: 'Allocated', updatedAt: new Date() });
    res.json({ seat: updatedSeat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json(employee);
});

router.put('/:id', async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json(employee);
});

router.delete('/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
