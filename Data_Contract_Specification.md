# Data Contract Specification (JSON-First Modeling)

This document defines the data contracts for the **SafeDose** application using a JSON-first modeling approach. We define the shape of data before writing database schemas, backend routes, or frontend API calls.

This prevents frontend/backend mismatch, refactoring chaos, and inconsistent naming.

---

## Step 1 — Define the ENTITY Models (Database Thinking)

This represents how data is stored in the database.

### User Entity
```json
{
  "id": "uuid",
  "email": "string",
  "passwordHash": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Important:
- `passwordHash` (never return this to the frontend)
- Database may include internal fields (indexes, metadata)

### Medication Entity
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "string",
  "dosage": "string",
  "frequency": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Notice:
- `userId` exists (relationship to the User)
- May include timestamps not shown in the UI

---

## Step 2 — Define Backend DTO Models

DTO = Data Transfer Object

This is what your API sends/receives. DTOs are often DIFFERENT from database entities.

### Create Medication Request DTO
What the frontend sends to create a medication:
```json
{
  "name": "Aspirin",
  "dosage": "81mg",
  "frequency": "Once daily"
}
```

Notice:
- No `id`
- No `userId`
- No timestamps
Backend adds those when saving to the database.

### Medication Response DTO
What the backend returns:
```json
{
  "id": "med_101",
  "name": "Aspirin",
  "dosage": "81mg",
  "frequency": "Once daily",
  "createdAt": "2026-03-01T11:00:00Z"
}
```

Notice:
- `userId` not exposed
- `updatedAt` omitted
- Clean public shape

### Error DTO (Standardize This!)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Medication name is required",
    "details": []
  }
}
```

This should be consistent across all endpoints.

---

## Step 3 — Define Frontend View Models

Sometimes the frontend needs slightly different shapes. 

### MedicationCardViewModel
```json
{
  "id": "med_101",
  "name": "Aspirin",
  "details": "81mg - Once daily",
  "createdAt": "Mar 1, 2026"
}
```

Notice:
- `details` is derived from `dosage` and `frequency`
- Formatted date string
- Not identical to backend response

Frontend transforms backend DTO → View Model.

---

## Step 4 — Map the Flow (Industry Thinking)

Here’s how data flows through the SafeDose application:

**DB Entity** ⬇ **Backend DTO** ⬇ **Frontend View Model**

Example:

**1. Medication Entity (Database):**
```json
{
  "id": "med_101",
  "userId": "user_1",
  "name": "Aspirin",
  "dosage": "81mg",
  "frequency": "Once daily",
  "createdAt": "2026-03-01T11:00:00Z",
  "updatedAt": "2026-03-01T11:00:00Z"
}
```

Backend transforms it to:

**2. MedicationResponse DTO (API Response):**
```json
{
  "id": "med_101",
  "name": "Aspirin",
  "dosage": "81mg",
  "frequency": "Once daily",
  "createdAt": "2026-03-01T11:00:00Z"
}
```

Frontend transforms it to:

**3. MedicationCardViewModel (React UI):**
```json
{
  "id": "med_101",
  "name": "Aspirin",
  "details": "81mg - Once daily",
  "createdAt": "Mar 1, 2026"
}
```
