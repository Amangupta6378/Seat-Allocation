const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authMiddleware = require('./middleware/auth');

const app = express();

const localOrigins = ['http://localhost:3000', 'http://localhost:4173', 'http://localhost:5173'];
const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (configuredOrigins.length === 0 || configuredOrigins.includes(origin) || localOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  }
};

app.use(helmet());
app.use(cors(corsOptions));
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
