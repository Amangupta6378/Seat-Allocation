const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  floor: { type: Number, required: true },
  zone: { type: String, required: true },
  bay: { type: Number, required: true },
  seatNumber: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], default: 'Available' },
  allocatedEmployee: { type: String, default: null },
  allocatedEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  allocatedProject: { type: String, default: null },
  allocationDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

seatSchema.index({ floor: 1, zone: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
