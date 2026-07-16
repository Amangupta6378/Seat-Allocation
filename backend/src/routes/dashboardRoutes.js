const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Seat = require('../models/Seat');
const { PROJECT_NAMES } = require('../utils/constants');

router.get('/summary', async (_req, res) => {
  const [employees, projects, seats] = await Promise.all([
    Employee.find(),
    Project.find(),
    Seat.find()
  ]);

  const totalSeats = seats.length || 5000;
  const occupiedSeats = seats.filter((seat) => seat.status === 'Occupied').length;
  const availableSeats = seats.filter((seat) => seat.status === 'Available').length;
  const reservedSeats = seats.filter((seat) => seat.status === 'Reserved').length;
  const maintenanceSeats = seats.filter((seat) => seat.status === 'Maintenance').length;
  const pendingAllocation = employees.filter((employee) => employee.seatAllocationStatus === 'Pending').length;

  const projectWiseAllocation = PROJECT_NAMES.map((name) => ({
    project: name,
    allocatedSeats: seats.filter((seat) => seat.allocatedProject === name && seat.status === 'Occupied').length,
    employees: employees.filter((employee) => employee.project === name).length
  }));

  const floorWiseOccupancy = seats.reduce((acc, seat) => {
    const existing = acc.find((item) => item.floor === seat.floor);
    const floorEntry = existing || { floor: seat.floor, total: 0, occupied: 0, available: 0, reserved: 0, maintenance: 0 };
    floorEntry.total += 1;
    if (seat.status === 'Occupied') floorEntry.occupied += 1;
    if (seat.status === 'Available') floorEntry.available += 1;
    if (seat.status === 'Reserved') floorEntry.reserved += 1;
    if (seat.status === 'Maintenance') floorEntry.maintenance += 1;
    if (!existing) acc.push(floorEntry);
    return acc;
  }, []).sort((a, b) => a.floor - b.floor);

  const summary = {
    totalEmployees: employees.length,
    totalSeats,
    occupiedSeats,
    availableSeats,
    reservedSeats,
    maintenanceSeats,
    pendingAllocation,
    projectWiseAllocation,
    floorWiseOccupancy
  };
  res.json(summary);
});

router.get('/project-utilization', async (_req, res) => {
  const [projects, employees, seats] = await Promise.all([Project.find(), Employee.find(), Seat.find()]);
  const data = projects.map((project) => ({
    name: project.name,
    employees: employees.filter((employee) => employee.project === project.name).length,
    allocatedSeats: seats.filter((seat) => seat.allocatedProject === project.name && seat.status === 'Occupied').length
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
      if (seat.status === 'Available') existing.available += 1;
      if (seat.status === 'Reserved') existing.reserved += 1;
      if (seat.status === 'Maintenance') existing.maintenance += 1;
    } else {
      acc.push({
        floor: seat.floor,
        total: 1,
        occupied: seat.status === 'Occupied' ? 1 : 0,
        available: seat.status === 'Available' ? 1 : 0,
        reserved: seat.status === 'Reserved' ? 1 : 0,
        maintenance: seat.status === 'Maintenance' ? 1 : 0
      });
    }
    return acc;
  }, []);
  res.json(data);
});

module.exports = router;
