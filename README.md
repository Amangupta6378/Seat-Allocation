# Ethara Seat Allocation & Project Mapping System

## Overview
A full-stack seat allocation and project mapping system for managing ~5,000 employees at Ethara. The system provides centralized tracking of employee seating, project assignments, floor allocation, and joining updates with an AI-powered assistant for natural language queries.

## Features
- **Employee Management**: Full CRUD with search, filter, pagination
- **Project Mapping**: 11 active projects with employee assignment tracking
- **Seat Allocation**: 6,600 seats across 6 floors, 10 zones with automatic team-proximity allocation
- **New Joiner Workflow**: Smart seat suggestions based on project team location
- **Dashboard**: Real-time metrics with interactive charts (project utilization, floor occupancy)
- **AI Assistant**: Natural language query interface for seat/project information
- **Authentication**: JWT-based signup/login
- **Allocation History**: Full audit trail of seat assignments and releases

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Tailwind CSS 3 |

## Project Structure
```
ethara-seat-allocation/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── models/          # Mongoose schemas (Employee, Project, Seat, User)
│   │   ├── routes/          # Express route handlers
│   │   ├── seed/            # Database seeding scripts
│   │   ├── utils/           # AI assistant, allocation logic
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   └── test/                # Unit tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application with routing
│   │   ├── AuthPage.jsx     # Login/Signup page
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   └── vite.config.js       # Vite configuration
├── AI_PROMPTS.md            # AI tool usage documentation
├── DATABASE_SCHEMA.md       # Database schema documentation
└── README.md                # This file
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone <repository-url>
cd Seat-Allocation
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ethara
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Seed the database
```bash
cd backend && npm run seed
```
This creates:
- 11 projects (Indigo, Indreed, Mydreed, Preed, Serfy, Oreed, bedegreed, Opreed, Serry, Kaary, Mered)
- 5,000 employees with realistic data
- 6,600 seats across 6 floors and 10 zones
- ~4,450 occupied seats, 500+ available, 100 reserved, 50 maintenance
- Allocation history records
- Admin user account

### 5. Start the application
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login user |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | List employees (search, filter, paginate) |
| GET | /api/employees/:id | Get employee details |
| POST | /api/employees | Create employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Deactivate employee |
| POST | /api/employees/:id/allocate | Auto-allocate seat |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id/employees | List project employees |

### Seats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/seats | List seats (filter by floor/zone/status) |
| GET | /api/seats/available | List available seats |
| POST | /api/seats | Create seat |
| POST | /api/seats/allocate | Allocate seat to employee |
| POST | /api/seats/release | Release seat |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/summary | Aggregate metrics |
| GET | /api/dashboard/project-utilization | Seats per project |
| GET | /api/dashboard/floor-utilization | Floor occupancy |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/query | Natural language query |

### Seat Allocations (History)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/seat-allocations | List all allocations |
| GET | /api/seat-allocations/recent | Recent allocations |
| GET | /api/seat-allocations/employee/:id | Employee allocation history |

## Business Rules
1. One employee can have only one active seat
2. One seat can be allocated to only one active employee
3. Released seats become available again
4. Reserved seats cannot be allocated unless status is changed
5. New joiners are prioritized for seats near their project team
6. Duplicate employee emails are not allowed
7. Duplicate seat numbers on the same floor/zone are not allowed
8. Employee deletion deactivates (soft delete) and releases their seat

## Deployment

### Recommended setup
- **Frontend**: Vercel from the `frontend/` folder
- **Backend**: Render from the `backend/` folder
- **Database**: MongoDB Atlas

### Backend on Render
Use the included `backend/render.yaml` blueprint or create a Render Web Service with these settings:
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

Required environment variables:
- `MONGODB_URI` - your MongoDB Atlas connection string
- `JWT_SECRET` - a strong signing secret
- `ALLOWED_ORIGINS` - your Vercel frontend URL, for example `https://your-app.vercel.app`

### Frontend on Vercel
Deploy the `frontend/` folder as a Vite project.

Required environment variable:
- `VITE_API_URL` - your Render backend URL, for example `https://your-backend.onrender.com`

The frontend uses `VITE_API_URL` in production and falls back to the local `/api` proxy during development.

The included `frontend/vercel.json` keeps React Router routes working on refresh.
