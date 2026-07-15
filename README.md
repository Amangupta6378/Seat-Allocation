# Ethara Seat Allocation & Project Mapping System

## Overview
This project is a full-stack seat allocation and project mapping application for managing employees, offices, projects, and seat assignments with authentication and dashboards.

## Features
- Secure signup/login with JWT authentication
- MongoDB-backed employee, project, seat, and user management
- Dashboard metrics for projects, seat utilization, and allocation status
- AI assistant for seat and project queries
- Local development setup with seeded demo data for 5,000 employees and 6,600 seats
- Business rules for one active seat per employee, reserved seats, and pending allocations

## Project Structure
- backend/: Express API, MongoDB models, auth middleware, and seed scripts
- frontend/: React + Vite + Tailwind UI with protected routes

## Setup
1. Install backend dependencies: `cd backend && npm install`
2. Install frontend dependencies: `cd frontend && npm install`
3. Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017/ethara`
4. Seed demo data: `cd backend && npm run seed`
5. Start backend: `cd backend && npm run dev`
6. Start frontend: `cd frontend && npm run dev`

## Demo Credentials
- Email: `admin@example.com`
- Password: `admin123`

## Notes
The application is currently configured for a local MongoDB development environment and can be extended to MongoDB Atlas later with a single connection-string change.
