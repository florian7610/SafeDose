import type { ApiEndpointContract } from "@/types/contracts";

export const API_CONTRACT: ApiEndpointContract[] = [
  {
    endpoint: "/api/auth/login",
    method: "POST",
    authRequired: false,
    requestDto: "LoginRequestDto",
    responseDto: "AuthResponseDto",
    statusCodes: [
      { code: 200, meaning: "Authenticated successfully" },
      { code: 400, meaning: "Validation error" },
      { code: 401, meaning: "Invalid credentials" },
    ],
  },
  {
    endpoint: "/api/auth/register",
    method: "POST",
    authRequired: false,
    requestDto: "RegisterRequestDto",
    responseDto: "AuthResponseDto",
    statusCodes: [
      { code: 201, meaning: "User created" },
      { code: 400, meaning: "Validation error" },
      { code: 409, meaning: "Email already exists" },
    ],
  },
  {
    endpoint: "/api/dashboard/summary",
    method: "GET",
    authRequired: true,
    requestDto: "None",
    responseDto: "DashboardSummaryResponseDto",
    statusCodes: [
      { code: 200, meaning: "Summary returned" },
      { code: 401, meaning: "Unauthorized" },
    ],
  },
  {
    endpoint: "/api/medications",
    method: "GET",
    authRequired: true,
    requestDto: "None",
    responseDto: "MedicationResponseDto[]",
    statusCodes: [
      { code: 200, meaning: "Medication list returned" },
      { code: 401, meaning: "Unauthorized" },
    ],
  },
  {
    endpoint: "/api/medications",
    method: "POST",
    authRequired: true,
    requestDto: "CreateMedicationRequestDto",
    responseDto: "MedicationResponseDto",
    statusCodes: [
      { code: 201, meaning: "Medication created" },
      { code: 400, meaning: "Validation error" },
      { code: 401, meaning: "Unauthorized" },
    ],
  },
  {
    endpoint: "/api/medications/:id",
    method: "PATCH",
    authRequired: true,
    requestDto: "UpdateMedicationRequestDto",
    responseDto: "MedicationResponseDto",
    statusCodes: [
      { code: 200, meaning: "Medication updated" },
      { code: 400, meaning: "Validation error" },
      { code: 401, meaning: "Unauthorized" },
      { code: 404, meaning: "Medication not found" },
    ],
  },
  {
    endpoint: "/api/medications/:id",
    method: "DELETE",
    authRequired: true,
    requestDto: "None",
    responseDto: "{ deleted: true }",
    statusCodes: [
      { code: 200, meaning: "Medication deleted" },
      { code: 401, meaning: "Unauthorized" },
      { code: 404, meaning: "Medication not found" },
    ],
  },
  {
    endpoint: "/api/interactions",
    method: "GET",
    authRequired: true,
    requestDto: "None",
    responseDto: "InteractionResponseDto[]",
    statusCodes: [
      { code: 200, meaning: "Interactions returned" },
      { code: 401, meaning: "Unauthorized" },
    ],
  },
];
