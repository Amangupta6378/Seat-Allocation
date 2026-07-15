const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Employee = require('../models/Employee');

router.get('/', async (_req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id/employees', async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const employees = await Employee.find({ project: project.name });
  res.json(employees);
});

module.exports = router;
