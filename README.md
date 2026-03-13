# SafeDose Prototype (Next.js App Router)

A fully navigable medication safety prototype built from the wireframe requirements.

## Team

Team Name: SafeDose

| Student Name | Student ID | Roles |
|---|---|---|
| Ravindar Pudugurthi | N01670407 | UI, Docs |
| Jahnavi Etikoti | N01687105 | Backend, Auth |
| Doyen Florian Irumva | N01660621 | DB, DevOps |

## Current Constraints
- Uses static JSON mock data
- No database
- No real backend integration
- Navigation fully working
- Forms UI with validation only
- Basic state management via React context
- Responsive UI across desktop/mobile

## Routes
- `/` Landing/Home
- `/login` Login
- `/register` Register
- `/dashboard` Dashboard
- `/meds` Medication Manager
- `/interactions` Interaction Center

## Run Locally
```bash
npm install
npm run dev
```

Build check:
```bash
npm run build
```

## Project Links
- Postman API Documentation: https://documenter.getpostman.com/view/50587900/2sBXigKY32
- Vercel Deployment: https://vercel.com/florian7610s-projects/test-project/FHJacQCgNfFFNu2v6qsXKDXu8vHg

## Project Timeline (Planned)
- Week 1: Project Charter completion and Environment Setup (Git, IDE, Boilerplates).
- Week 2: Backend: User Auth (JWT) and Database Schema design.
- Week 3: Frontend: Login/Signup pages using Bootstrap; Client-side routing.
- Week 4: Backend: CRUD API for medications; Frontend: Add Medication form.
- Week 5: API Integration: Connect backend to openFDA; Fetch drug data by name.
- Week 6: Logic Development: Compare user medication list against openFDA interaction data.
- Week 7: Dashboard UI: Build the Today’s Doses checklist and safety alert popups.
- Week 8: Testing and Bug Fixing: User acceptance testing and responsive design tweaks.
- Week 9: Final Deployment and Project Documentation/Presentation.

## Future Database Design (MongoDB)

Planned collections:
- `users`: account identity and profile information.
- `medications`: per-user medication records (drug name, dosage, schedule, status, RxCUI).
- `interactions`: detected medication interaction results, severity, recommendations, and review state.
- `adherence_logs`: daily dose completion events for tracking consistency over time.

Proposed relationship model:
- One `users` document can have many `medications`.
- One `users` document can have many `interactions`.
- One `medications` document can have many `adherence_logs` entries.

Key planned fields:
- `users`: `_id`, `firstName`, `lastName`, `email` (unique), `passwordHash`, `role`, `createdAt`, `updatedAt`.
- `medications`: `_id`, `userId`, `name`, `genericName`, `dosage`, `frequency`, `scheduleTime`, `status`, `rxcui`, `createdAt`, `updatedAt`.
- `interactions`: `_id`, `userId`, `drugIds`, `severity`, `summary`, `recommendation`, `fdaSource`, `reviewed`, `createdAt`.
- `adherence_logs`: `_id`, `userId`, `medicationId`, `scheduledFor`, `takenAt`, `status`, `createdAt`.

Planned indexes:
- `users.email` unique index for login and registration integrity.
- `medications.userId` index for fast per-user medication retrieval.
- `interactions.userId` index for dashboard and safety center queries.
- `adherence_logs.userId + scheduledFor` compound index for timeline and adherence reporting.

## Architecture and Contracts
- C4 model: `docs/c4-model.md`
- API contract summary (backend planning): `docs/api-contract.md`
- Postman collection export: `docs/postman/safedose-api-contract.postman_collection.json`
- Data contract specification (Entity/DTO/Error/View models): `docs/models-and-viewmodels.md`
- Type definitions in code: `src/types/contracts.ts`

## Data Source
Static JSON files in `src/data`:
- `user.json`
- `medications.json`
- `interactions.json`
