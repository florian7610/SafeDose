# SafeDose C4 Model

## Level 1: System Context
- Person: Patient/Caregiver
- System: SafeDose Prototype (Next.js web app)
- External system: openFDA API (conceptual only in this prototype)
- Relationship: User interacts with SafeDose via browser; SafeDose would query external FDA dataset in production.

## Level 2: Container Diagram
- Container 1: Next.js App Router frontend
- Container 2: Mock service layer (in-memory state + static JSON)
- Container 3: JSON mock data store (`src/data/*.json`)
- Relationship:
  - UI pages call local state actions
  - State provider reads seeded JSON and maps to view models
  - No database and no remote API integration

## Level 3: Component Diagram (Interaction Feature)
- Component: Interaction page (`src/app/interactions/page.tsx`)
- Component: App state provider (`src/components/providers/app-state-provider.tsx`)
- Component: Mapper utilities (`src/lib/mock-mappers.ts`)
- Component: Interaction JSON source (`src/data/interactions.json`)
- Data flow:
  1. User opens interactions route.
  2. Provider exposes medication and interaction state.
  3. Mapper converts entities to frontend view models.
  4. UI filters and renders severity cards and details.

## Notes
- C4 structure is preserved while intentionally replacing backend/database layers with mock JSON for rapid prototyping.
