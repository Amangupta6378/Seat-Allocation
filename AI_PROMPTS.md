# AI Prompts and Validation Log

## Prompt 1 – Architecture & Planning
**Prompt**: "Design a production-ready seat allocation and project mapping system for Ethara with approximately 5,000 employees. The system needs to track employee seating across 6 floors with 10 zones each, manage project assignments for 11 projects (Indigo, Indreed, Mydreed, etc.), and provide real-time dashboard analytics. Requirements: React frontend with Tailwind CSS, Node.js/Express backend, MongoDB database, JWT authentication, and an AI-powered natural language query assistant. Please outline the architecture, database schema, API endpoints, and component structure."

**Follow-up**: "Break down the system into modules: authentication, employee management, seat allocation with team-proximity logic, project mapping, dashboard analytics, and AI assistant. What are the key business rules to enforce?"

**What AI generated correctly**: Modular architecture with clear separation of concerns, RESTful API design, and the overall project structure.

**What AI generated incorrectly**: Initial suggestion used a monolithic single-file approach. Had to guide it toward proper file separation.

## Prompt 2 – Database Design
**Prompt**: "Design MongoDB schemas for: (1) Employee - with employeeCode, name, email, department, role, joiningDate, employmentStatus, project, seatAllocationStatus; (2) Project - with name, description, manager_name, status; (3) Seat - with floor, zone, bay, seatNumber, status enum (Available/Occupied/Reserved/Maintenance), allocatedEmployee, allocatedProject, allocationDate; (4) SeatAllocation - allocation history with employee_id, seat_id, project, allocation_status, allocation_date, released_date; (5) User - for auth with name, email, hashed password, role. Include unique constraints and indexes."

**Follow-up**: "Add a compound unique index on (floor, zone, seatNumber) for the Seat schema to prevent duplicate seats. Add unique constraint on employee email and employeeCode."

**What AI generated correctly**: Schema structure with proper types and references.

**What AI generated incorrectly**: Initially missed the SeatAllocation history table. Also did not include the compound unique index for seats.

**What candidate manually fixed**: Added SeatAllocation model, added compound unique index, ensured proper enum validation on seat status.

## Prompt 3 – Backend APIs
**Prompt**: "Generate Express.js REST API routes for: (1) Auth - signup with employee creation, login with JWT; (2) Employees - CRUD with search/filter by name/email/code/project/department/status, soft delete (deactivate); (3) Projects - create, list, get employees by project; (4) Seats - list with filters, available seats, allocate with duplicate check, release, bulk allocate; (5) Dashboard - summary metrics, project utilization, floor utilization; (6) AI query endpoint. Include JWT auth middleware on all routes except auth."

**Follow-up**: "For employee deletion, don't hard delete. Instead: (a) set employmentStatus to Inactive, (b) find their allocated seat, (c) release the seat back to Available, (d) create a Released SeatAllocation record. Return the updated employee."

**Follow-up**: "For seat allocation, implement team-proximity logic: find which floor/zone has the most teammates from the same project, prefer available seats there. If no seats in preferred zone, suggest alternate zones."

**What AI generated correctly**: Basic CRUD routes, JWT middleware, search with regex.

**What AI generated incorrectly**: DELETE endpoint initially used findByIdAndDelete (hard delete). Allocation didn't create SeatAllocation records. Dashboard loaded all documents into memory instead of using aggregation.

**What candidate manually fixed**: Changed DELETE to soft delete with seat release, added SeatAllocation record creation on allocate/release, optimized dashboard with countDocuments.

## Prompt 4 – Seat Allocation Logic
**Prompt**: "Implement smart seat allocation for new employees: (1) Find all occupied seats for the employee's project, (2) determine the most common floor+zone combination, (3) search for available seats in that zone first, (4) if none available, expand to other zones on the same floor, (5) if still none, suggest any available seat. Include role-based floor preferences (Engineers→Floors 1-2, Managers→Floors 2-3, etc.). Return the suggested seat with a reason message."

**What AI generated correctly**: The core proximity-finding algorithm and role-based preferences.

**What AI generated incorrectly**: Initial version didn't handle the fallback case properly when no teammates existed yet.

**What candidate manually fixed**: Added proper fallback chain and reason messages for each suggestion scenario.

## Prompt 5 – AI Assistant
**Prompt**: "Build a keyword-based natural language assistant that handles these queries: (1) 'Where is employee X seated?' - lookup by name, return floor/zone/bay/seat; (2) 'Which project am I assigned to?' - use logged-in user context; (3) 'Show available seats on Floor N' - count available seats; (4) 'Who is sitting near X?' - find employees in same floor+zone; (5) 'How many seats are occupied for Project Y?' - count occupied seats; (6) 'Allocate seat for new employee' - suggest using allocation endpoint. Use regex matching for intent detection."

**Follow-up**: "For the 'near me' query, find the employee's seat first, then query all occupied seats on the same floor and zone, populate the employee names, and return up to 5 nearby colleagues."

**What AI generated correctly**: Regex patterns for intent matching, basic query-response structure.

**What AI generated incorrectly**: Initially only handled 3 of 6 query types. The 'near me' and 'project seats' intents were missing.

**What candidate manually fixed**: Added missing intent handlers, improved regex patterns, added proper error messages.

## Prompt 6 – Frontend UI
**Prompt**: "Create a premium React dashboard UI with Tailwind CSS for a seat allocation system. Design: dark sidebar navigation (slate-900 gradient) with nav links (Dashboard, Employees, Seats, AI Assistant), main content area with light background. Dashboard: 6 stat cards with colored borders, Recharts bar charts for project utilization and floor occupancy. Employees: searchable table with pagination, status badges, allocate button. Seats: filtered table with color-coded status. AI: chat-bubble interface with suggested questions."

**Follow-up**: "Add Inter font from Google Fonts. Include CSS animations (fadeIn, slideUp) for page transitions. Add hover effects on all interactive elements. Make the design responsive with mobile breakpoints."

**Follow-up**: "Add a modal form for adding new employees with fields: name, email, department, role, project (dropdown with 11 projects), joining date. The modal should have backdrop blur overlay."

**What AI generated correctly**: Overall layout structure, Tailwind class composition, Recharts integration.

**What AI generated incorrectly**: Initial design was too minimal - plain white cards without visual hierarchy. Charts were not properly sized. No loading states.

**What candidate manually fixed**: Enhanced color palette, added gradient accents, improved card design with borders and shadows, added proper loading and error states, ensured responsive breakpoints work.

## Prompt 7 – Testing
**Prompt**: "Write unit tests for the AI assistant intent matching using Node.js built-in test runner. Test cases: (1) 'Where is employee Amit seated?' extracts name and returns seat-location intent; (2) 'Show available seats on Floor 3' returns available-seats intent; (3) 'How many seats occupied for Project Indigo' returns project-seats intent; (4) 'Who is sitting near Amit' returns nearby intent; (5) fallback for unrecognized queries."

**What AI generated correctly**: Test structure and assertions.

**What candidate manually fixed**: Updated test data to match actual response format.

## Prompt 8 – Debugging
**Prompt**: "The seed script creates seats with mixed statuses but then resets ALL seats to Available at the end, wiping out the distribution. Fix the seed to properly maintain the status distribution: ~4,450 Occupied, 500+ Available, 100 Reserved, 50 Maintenance."

**Follow-up**: "The DELETE /employees/:id endpoint does a hard delete instead of deactivating. Fix it to: set status to Inactive, release their seat, create a Released allocation record, return the updated employee."

**Follow-up**: "The main seed script uses wrong project names (Talos, Astra, etc.) instead of the required names (Indigo, Indreed, Mydreed, Preed, Serfy, Oreed, bedegreed, Opreed, Serry, Kaary, Mered). Fix this."

**What was wrong**: Seed data bug wiped allocation data, wrong project names, hard delete instead of soft delete.

**What candidate fixed**: Rewrote seed script with correct project names and proper allocation distribution, changed DELETE to deactivation.

## Prompt 9 – Deployment
**Prompt**: "Prepare the application for deployment: (1) Create .env.example with all required environment variables, (2) Update README with deployment instructions for Railway (backend) and Vercel (frontend), (3) Ensure the backend serves on dynamic PORT, (4) Configure CORS for production frontend URL."

**What AI generated correctly**: Environment variable setup, PORT configuration.

**What candidate manually fixed**: Added proper CORS configuration, verified MongoDB Atlas connection string format.

## Prompt 10 – Refactoring
**Prompt**: "Review the codebase for code quality: (1) Remove dead code (unused in-memory store), (2) Add proper error handling on all routes, (3) Ensure consistent response formats, (4) Add input validation, (5) Optimize database queries (use countDocuments instead of loading all records)."

**What AI generated correctly**: Identified optimization opportunities.

**What candidate manually fixed**: Dashboard queries optimized from loading full collections to using countDocuments, proper error handling added to all route handlers.

## How Candidate Verified Correctness
1. **Seed Script**: Ran `npm run seed` and verified counts in MongoDB: 5,000 employees, 6,600 seats, 11 projects, correct distribution of seat statuses
2. **API Testing**: Used curl/Postman to test all endpoints: CRUD operations, search/filter, allocation/release
3. **AI Assistant**: Tested all 6 query types with various phrasings, verified responses match expected format
4. **Frontend**: Ran `npm run dev`, verified all pages render, tested search/filter/pagination, verified chart data
5. **Build Verification**: Ran `npm run build` on frontend to verify production build succeeds
6. **Business Rules**: Tested duplicate allocation prevention, reserved seat protection, soft delete behavior
