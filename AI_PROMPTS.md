# AI Prompts and Validation Log

## Prompt used for planning
Prompt: "Design a production-ready seat allocation and project mapping system for a large office environment with React, Tailwind, Node.js, Express, and MongoDB. Include authentication, dashboards, employee and seat management, and AI-powered query support."

## Prompt used for backend
Prompt: "Generate backend routes and controllers for authentication, employees, projects, seats, dashboard metrics, and AI assistant queries using Express and MongoDB."

## Prompt used for database design
Prompt: "Design MongoDB collections for employees, projects, seats, users, and seat allocations with rules for uniqueness, active seat assignment, reserved seats, and pending allocations."

## Prompt used for frontend
Prompt: "Create a modern React and Tailwind frontend with login, dashboard, employee list, seat list, search filters, and an AI assistant interface."

## Prompt used for AI assistant
Prompt: "Build a natural language assistant that can answer questions about employee seat location, project assignments, available seats, and team locations using a fallback keyword-based parser."

## Prompt used for debugging
Prompt: "Help debug authentication issues, MongoDB connection issues, seed data problems, and route behavior while verifying the app end to end."

## Prompt used for deployment
Prompt: "Prepare deployment guidance for running the app locally and explain how the backend and frontend should be started for a demo environment."

## What AI generated correctly
- Project structure and route organization
- Authentication flow with JWT-based login and signup
- Dashboard layout and core UI sections
- Initial employee, project, seat, and user models
- A rule-based assistant that can respond to seat and project queries

## What AI generated incorrectly
- The first draft used an overly small seed dataset instead of the required large-scale dataset
- Some initial seat numbering and allocation logic did not fully match the business rules
- The first prototype did not fully reflect reserved-seat and pending-allocation behavior

## What candidate manually fixed
- Replaced the small demo seed with a large-scale generator for 5,000 employees and 6,600 seats
- Added stronger seat generation logic with reserved seats and pending allocation states
- Corrected the AI assistant parser to answer the required seat-location and available-seat queries
- Verified the backend and frontend by running tests and a production build

## How candidate verified correctness
- Ran the backend seed script successfully and confirmed the generated counts
- Ran the backend test suite for the AI assistant logic
- Built the frontend successfully with Vite
- Verified that the app responds to seat and project queries through the assistant endpoint
