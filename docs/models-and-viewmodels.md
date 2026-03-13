# Data Contract Specification (JSON-First Modeling)

Type definitions are maintained in `src/types/contracts.ts`. This document is the backend planning reference for model and DTO implementation.

## 1) Entity Models (Database Level)

### UserEntity
```json
{
	"id": "user-001",
	"firstName": "Ravindar",
	"lastName": "Patel",
	"email": "ravindar.patel@example.com",
	"role": "patient"
}
```

### MedicationEntity
```json
{
	"id": "med-001",
	"userId": "user-001",
	"name": "Metformin",
	"genericName": "Glucophage",
	"dosage": "500mg",
	"frequency": "Twice daily",
	"scheduleTime": "08:00",
	"status": "active",
	"rxcui": "860975",
	"takenToday": false,
	"createdAt": "2026-03-12T18:30:00.000Z",
	"updatedAt": "2026-03-12T18:30:00.000Z"
}
```

### InteractionEntity
```json
{
	"id": "int-001",
	"userId": "user-001",
	"drugIds": ["med-001", "med-003"],
	"severity": "HIGH",
	"summary": "Increased bleeding risk",
	"recommendation": "Contact physician",
	"fdaSource": "https://open.fda.gov/apis/drug/label/",
	"reviewed": false,
	"createdAt": "2026-03-12T19:00:00.000Z"
}
```

## 2) Request DTOs

### Auth
- `LoginRequestDto`
- `RegisterRequestDto`

### Medications
- `CreateMedicationRequestDto`
- `UpdateMedicationRequestDto`

### User Profile
- `UpdateUserProfileRequestDto`

### Example Request JSON
```json
{
	"firstName": "Ravindar",
	"lastName": "Patel",
	"email": "ravindar.patel@example.com",
	"role": "caregiver"
}
```

## 3) Response DTOs

- `AuthResponseDto`
- `MedicationResponseDto`
- `InteractionResponseDto`
- `DashboardSummaryResponseDto`

### Example Dashboard Response
```json
{
	"activeMedicationCount": 5,
	"adherencePercent": 80,
	"activeInteractionCount": 2,
	"dosesDueToday": 3
}
```

## 4) Standard Error Model

- `StandardErrorModel`

### Canonical JSON
```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Request validation failed",
		"details": {
			"fieldName": ["Reason here"]
		},
		"traceId": "trace-123",
		"timestamp": "2026-03-12T19:00:00.000Z"
	}
}
```

## 5) Frontend View Models

- `MedicationViewModel`
- `InteractionViewModel`
- `DashboardStatViewModel`

These are presentation-ready transformations used by page components and mappers (`src/lib/mock-mappers.ts`).

## Backend Integration Mapping (What to Implement)

- Map MongoDB documents to Entity models without leaking internal DB fields
- Validate all request payloads before business logic
- Return only Response DTO shapes to frontend
- Normalize errors to `StandardErrorModel` format across all controllers
- Keep view models frontend-only; backend should not return view-model-specific fields

## Current Mock Source

Until backend is integrated, static seed data remains in:
- `src/data/user.json`
- `src/data/medications.json`
- `src/data/interactions.json`
