const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const Employee = require('../models/Employee');
const Project = require('../models/Project');

const SYSTEM_ACCOUNTS = {
  'admin@example.com': { username: 'admin', name: 'Admin User', password: 'admin123', role: 'admin' },
  'hr@example.com': { username: 'hr', name: 'HR User', password: 'hr1234', role: 'hr' }
};

router.post('/signup', async (req, res) => {
  try {
    const { username, name, email, password, department, role, joiningDate, project, projectId } = req.body;
    const resolvedUsername = (username || email || name || '').toLowerCase().trim().replace(/\s+/g, '.');

    if (!resolvedUsername || !name || !email || !password || !department || !role || !joiningDate || !project) {
      return res.status(400).json({ error: 'All signup fields are required' });
    }

    const normalizedRole = String(role).toLowerCase();
    if (!['admin', 'hr'].includes(normalizedRole)) {
      const existingEmployee = await Employee.findOne({ $or: [{ email }, { employeeCode: req.body.employeeCode }] });
      if (existingEmployee) {
        return res.status(409).json({ error: 'Employee already exists' });
      }

      const projectRecord = projectId ? await Project.findById(projectId) : await Project.findOne({ name: project });
      const projectName = projectRecord ? projectRecord.name : project;
      const projectRef = projectRecord ? projectRecord._id : null;

      const employeeCount = await Employee.countDocuments();
      const employee = await Employee.create({
        employeeCode: req.body.employeeCode || `EMP${String(employeeCount + 1).padStart(4, '0')}`,
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

      return res.status(201).json({ employee, message: 'Employee saved in Employee collection' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username: resolvedUsername }] });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const projectRecord = projectId ? await Project.findById(projectId) : await Project.findOne({ name: project });
    const projectName = projectRecord ? projectRecord.name : project;
    const projectRef = projectRecord ? projectRecord._id : null;

    const user = await User.create({ username: resolvedUsername, name, email, password, role: normalizedRole });

    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });

    res.status(201).json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }) || await User.findOne({ username: normalizedEmail });

    if (!user && SYSTEM_ACCOUNTS[normalizedEmail] && password === SYSTEM_ACCOUNTS[normalizedEmail].password) {
      const account = SYSTEM_ACCOUNTS[normalizedEmail];
      const createdUser = await User.create({
        username: account.username,
        name: account.name,
        email: normalizedEmail,
        password,
        role: account.role
      });

      const token = jwt.sign({ id: createdUser._id, username: createdUser.username, email: createdUser.email, role: createdUser.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
      return res.json({ token, user: { id: createdUser._id, username: createdUser.username, name: createdUser.name, email: createdUser.email, role: createdUser.role } });
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
    res.json({ token, user: { id: user._id, username: user.username, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', async (req, res) => {
  res.status(404).json({ error: 'Not implemented' });
});

module.exports = router;
