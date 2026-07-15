const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Seat = require('../models/Seat');

router.get('/summary', async (_req, res) => {
  const [employees, projects, seats] = await Promise.all([
    Employee.find(),
    Project.find(),
    Seat.find()
  ]);

  const summary = {
    totalEmployees: employees.length,
    totalSeats: seats.length,
    occupiedSeats: seats.filter((seat) => seat.status === 'Occupied').length,
    availableSeats: seats.filter((seat) => seat.status === 'Available').length,
    reservedSeats: seats.filter((seat) => seat.status === 'Reserved').length,
    pendingAllocation: employees.filter((employee) => employee.seatAllocationStatus === 'Pending').length
  };
  res.json(summary);
});

router.get('/project-utilization', async (_req, res) => {
  const [projects, employees] = await Promise.all([Project.find(), Employee.find()]);
  const data = projects.map((project) => ({
    name: project.name,
    employees: employees.filter((employee) => employee.project === project.name).length
  }));
  res.json(data);
});

router.get('/floor-utilization', async (_req, res) => {
  const seats = await Seat.find();
  const data = seats.reduce((acc, seat) => {
    const existing = acc.find((item) => item.floor === seat.floor);
    if (existing) {
      existing.total += 1;
      if (seat.status === 'Occupied') existing.occupied += 1;
    } else {
      acc.push({ floor: seat.floor, total: 1, occupied: seat.status === 'Occupied' ? 1 : 0 });
    }
    return acc;
  }, []);
  res.json(data);
});

module.exports = router;
