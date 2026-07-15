const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const Employee = require('../models/Employee');
const Project = require('../models/Project');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, department, role, joiningDate, project, projectId } = req.body;
    if (!name || !email || !password || !department || !role || !joiningDate || !project) {
      return res.status(400).json({ error: 'All signup fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const projectRecord = projectId ? await Project.findById(projectId) : await Project.findOne({ name: project });
    const projectName = projectRecord ? projectRecord.name : project;
    const projectRef = projectRecord ? projectRecord._id : null;

    const user = await User.create({ name, email, password, role: 'employee' });
    const employeeCount = await Employee.countDocuments();
    await Employee.create({
      employeeCode: `EMP${String(employeeCount + 1).padStart(4, '0')}`,
      name,
      email,
      department,
      role,
      joiningDate,
      status: 'Active',
      employmentStatus: 'Active',
      projectId: projectRef,
      project: projectName,
      seatAllocationStatus: 'Pending'
    });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
