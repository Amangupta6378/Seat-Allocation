const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Seat = require('../models/Seat');
const { generateAssistantResponse } = require('../utils/aiAssistant');

router.post('/query', async (req, res) => {
  const query = req.body.query || '';
  const currentEmployee = await Employee.findOne({ email: req.body.email || '' });
  const employees = await Employee.find().sort({ name: 1 });
  const seats = await Seat.find().sort({ floor: 1, zone: 1, seatNumber: 1 });

  const result = generateAssistantResponse(query, currentEmployee, employees, seats);
  res.json({ intent: result.intent, result: result.answer });
});

module.exports = router;
