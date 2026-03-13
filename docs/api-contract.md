# API Contract (Backend Integration Draft)

This is the contract-first API plan for SafeDose backend integration. It is the source of truth for frontend and backend implementation alignment.

## Deliverables
- Postman Collection export: `docs/postman/safedose-api-contract.postman_collection.json`
- Endpoint summary: this document (`docs/api-contract.md`)
- Optional advanced: Swagger/OpenAPI spec can be generated from this contract later

## Auth and Conventions
- Base URL (dev): `http://localhost:4000`
- Auth mechanism: Bearer JWT
- Header: `Authorization: Bearer <accessToken>`
- Content type: `application/json`
- Protected endpoints: all routes except auth login/register

## Standard Error Format
All non-2xx responses must follow this shape.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "email": ["Email is required"]
    },
    "traceId": "a1b2c3d4",
    "timestamp": "2026-03-12T19:00:00.000Z"
  }
}
```

## Endpoint Index

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/login` | `POST` | No | Sign in user |
| `/api/auth/register` | `POST` | No | Register user |
| `/api/users/me` | `GET` | Yes | Fetch current user profile |
| `/api/users/me` | `PATCH` | Yes | Update current user profile |
| `/api/users/me` | `DELETE` | Yes | Delete current user account |
| `/api/dashboard/summary` | `GET` | Yes | Dashboard statistics |
| `/api/medications` | `GET` | Yes | List medications |
| `/api/medications` | `POST` | Yes | Create medication |
| `/api/medications/:id` | `PATCH` | Yes | Update medication fields |
| `/api/medications/:id` | `DELETE` | Yes | Remove medication |
| `/api/interactions` | `GET` | Yes | List interaction alerts |
| `/api/interactions/:id/review` | `PATCH` | Yes | Mark an interaction reviewed |

## Endpoint Details

### POST /api/auth/login
- Auth required: No
- Request JSON:
```json
{
  "email": "ravindar.patel@example.com",
  "password": "string"
}
```
- Response JSON (200):
```json
{
  "tokenType": "Bearer",
  "accessToken": "jwt-token",
  "expiresInSeconds": 3600,
  "user": {
    "id": "user-001",
    "fullName": "Ravindar Patel",
    "email": "ravindar.patel@example.com",
    "role": "patient"
  }
}
```
- Status codes: `200`, `400`, `401`

### POST /api/auth/register
- Auth required: No
- Request JSON:
```json
{
  "firstName": "Ravindar",
  "lastName": "Patel",
  "email": "ravindar.patel@example.com",
  "password": "string",
  "confirmPassword": "string"
}
```
- Response JSON (201): same as login payload
- Status codes: `201`, `400`, `409`

### GET /api/users/me
- Auth required: Yes
- Request JSON: none
- Response JSON (200):
```json
{
  "id": "user-001",
  "firstName": "Ravindar",
  "lastName": "Patel",
  "email": "ravindar.patel@example.com",
  "role": "patient"
}
```
- Status codes: `200`, `401`

### PATCH /api/users/me
- Auth required: Yes
- Request JSON:
```json
{
  "firstName": "Ravindar",
  "lastName": "Patel",
  "email": "ravindar.patel@example.com",
  "role": "caregiver"
}
```
- Response JSON (200): updated user profile (same shape as `GET /api/users/me`)
- Status codes: `200`, `400`, `401`, `409`

### DELETE /api/users/me
- Auth required: Yes
- Request JSON: none
- Response JSON (200):
```json
{
  "deleted": true,
  "userId": "user-001"
}
```
- Status codes: `200`, `401`, `404`

### GET /api/dashboard/summary
- Auth required: Yes
- Request JSON: none
- Response JSON (200):
```json
{
  "activeMedicationCount": 5,
  "adherencePercent": 40,
  "activeInteractionCount": 2,
  "dosesDueToday": 3
}
```
- Status codes: `200`, `401`

### GET /api/medications
- Auth required: Yes
- Request JSON: none
- Response JSON (200):
```json
[
  {
    "id": "med-001",
    "name": "Metformin",
    "genericName": "Glucophage",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "scheduleTime": "08:00",
    "status": "active",
    "rxcui": "860975",
    "takenToday": true
  }
]
```
- Status codes: `200`, `401`

### POST /api/medications
- Auth required: Yes
- Request JSON:
```json
{
  "name": "Metformin",
  "genericName": "Glucophage",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "scheduleTime": "08:00",
  "rxcui": "860975"
}
```
- Response JSON (201): one `MedicationResponseDto`
- Status codes: `201`, `400`, `401`, `409`

### PATCH /api/medications/:id
- Auth required: Yes
- Request JSON:
```json
{
  "dosage": "850mg",
  "takenToday": true
}
```
- Response JSON (200): updated medication
- Status codes: `200`, `400`, `401`, `404`

### DELETE /api/medications/:id
- Auth required: Yes
- Request JSON: none
- Response JSON (200):
```json
{
  "deleted": true,
  "medicationId": "med-001"
}
```
- Status codes: `200`, `401`, `404`

### GET /api/interactions
- Auth required: Yes
- Request JSON: none
- Response JSON (200):
```json
[
  {
    "id": "int-001",
    "severity": "HIGH",
    "drugNames": ["Lisinopril", "Warfarin"],
    "summary": "Increased bleeding risk...",
    "recommendation": "Contact physician",
    "fdaSource": "https://open.fda.gov/apis/drug/label/",
    "reviewed": false
  }
]
```
- Status codes: `200`, `401`

### PATCH /api/interactions/:id/review
- Auth required: Yes
- Request JSON:
```json
{
  "reviewed": true
}
```
- Response JSON (200):
```json
{
  "id": "int-001",
  "reviewed": true
}
```
- Status codes: `200`, `400`, `401`, `404`

## Next Backend Implementation Tasks
- Implement auth and token validation middleware
- Implement user profile endpoints (`GET/PATCH/DELETE /api/users/me`)
- Implement medications CRUD routes and validators
- Implement interactions aggregation and review route
- Ensure all error responses use `StandardErrorModel`
