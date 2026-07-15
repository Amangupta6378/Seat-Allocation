const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', authMiddleware, require('./routes/employeeRoutes'));
app.use('/api/projects', authMiddleware, require('./routes/projectRoutes'));
app.use('/api/seats', authMiddleware, require('./routes/seatRoutes'));
app.use('/api/dashboard', authMiddleware, require('./routes/dashboardRoutes'));
app.use('/api/ai', authMiddleware, require('./routes/aiRoutes'));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
