const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  role: { type: String, required: true },
  joiningDate: { type: String, required: true },
  status: { type: String, default: 'Active' },
  employmentStatus: { type: String, default: 'Active' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  project: { type: String, required: true },
  seatAllocationStatus: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
