// src/components/providers/app-state-provider.tsx
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from "react";
import type {
  CaregiverDashboardResponse,
  CreateMedicationRequestDto,
  CreatePatientRequestDto,
  InteractionEntity,
  LinkPatientRequestDto,
  MedicationEntity,
  RosterPatient,
  UpdateUserProfileRequestDto,
  UserEntity,
} from "@/types/contracts";

// ─── Context shape ───────────────────────────────────────────────────────────

interface AppStateContextValue {
  // Auth
  user: UserEntity | null;
  isAuthLoading: boolean;

  // Patient-facing state (only populated when role === "patient")
  medications: MedicationEntity[];
  interactions: InteractionEntity[];

  // Caregiver-facing state (only populated when role === "caregiver")
  caregiverDashboard: CaregiverDashboardResponse | null;
  isCaregiverLoading: boolean;

  // Patient actions
  toggleDose: (medicationId: string, doseIndex: number) => void;
  addMedication: (payload: CreateMedicationRequestDto) => Promise<void>;
  stopMedication: (medicationId: string) => void;   // soft-stop → history
  removeMedication: (medicationId: string) => void;  // hard-delete (accidental)
  updateUserProfile: (payload: UpdateUserProfileRequestDto) => void;
  deleteAccount: () => void;

  // Caregiver actions
  refreshCaregiverDashboard: () => Promise<void>;
  addPatient: (
    payload: CreatePatientRequestDto | LinkPatientRequestDto
  ) => Promise<RosterPatient | null>;
  removePatient: (patientId: string) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextValue | null>(null);

function buildIsoNow() {
  return new Date().toISOString();
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppStateProvider({ children }: PropsWithChildren) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setIsAuthLoading(false);
      }
    })();
  }, []);

  // ── Patient state ─────────────────────────────────────────────────────────
  const [medications, setMedications] = useState<MedicationEntity[]>([]);
  const [interactions, setInteractions] = useState<InteractionEntity[]>([]);

  useEffect(() => {
    if (!user || user.role !== "patient") {
      setMedications([]);
      setInteractions([]);
      return;
    }

    (async () => {
      try {
        const [medRes, intRes] = await Promise.all([
          fetch("/api/medications"),
          fetch("/api/interactions"),
        ]);
        if (medRes.ok) setMedications(await medRes.json());
        if (intRes.ok) setInteractions(await intRes.json());
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
      }
    })();
  }, [user]);

  // ── Caregiver state ───────────────────────────────────────────────────────
  const [caregiverDashboard, setCaregiverDashboard] =
    useState<CaregiverDashboardResponse | null>(null);
  const [isCaregiverLoading, setIsCaregiverLoading] = useState(false);

  const refreshCaregiverDashboard = useCallback(async () => {
    setIsCaregiverLoading(true);
    try {
      const res = await fetch("/api/caregiver/dashboard");
      if (res.ok) setCaregiverDashboard(await res.json());
    } catch (err) {
      console.error("Failed to fetch caregiver dashboard:", err);
    } finally {
      setIsCaregiverLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "caregiver") {
      setCaregiverDashboard(null);
      return;
    }
    refreshCaregiverDashboard();
  }, [user, refreshCaregiverDashboard]);

  // ── Patient actions ───────────────────────────────────────────────────────

  const toggleDose = useCallback(
    (medicationId: string, doseIndex: number) => {
      const med = medications.find((m) => m.id === medicationId);
      if (!med) return;
      const alreadyTaken = med.takenIndices.includes(doseIndex);
      const newIndices = alreadyTaken
        ? med.takenIndices.filter((i) => i !== doseIndex)
        : [...med.takenIndices, doseIndex].sort((a, b) => a - b);

      setMedications((prev) =>
        prev.map((m) =>
          m.id === medicationId
            ? { ...m, takenIndices: newIndices, takenToday: newIndices.length >= m.dosesPerDay, updatedAt: buildIsoNow() }
            : m
        )
      );

      fetch(`/api/medications/${medicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doseIndex, taken: !alreadyTaken }),
      }).catch(console.error);
    },
    [medications]
  );

  const addMedication = useCallback(
    async (payload: CreateMedicationRequestDto) => {
      if (!user) return;

      // Optimistic insert with a temp ID.
      // patientId is unknown client-side — the API resolves it via linkedUserId.
      // The real patientId arrives in the saved response and replaces this.
      const tempId = `temp-${crypto.randomUUID().slice(0, 8)}`;
      const optimistic: MedicationEntity = {
        id:           tempId,
        patientId:    "pending",
        addedBy:      user.id,
        name:         payload.name,
        genericName:  payload.genericName,
        dosage:       payload.dosage,
        frequency:    payload.frequency,
        scheduleTime: payload.scheduleTime,
        status:       "active",
        rxcui:        payload.rxcui,
        dosesPerDay:  payload.frequency === "twice daily" ? 2 : payload.frequency === "three times daily" ? 3 : 1,
        takenIndices: [],
        takenToday:   false,
        startDate:    payload.startDate ?? new Date().toISOString(),
        endDate:      payload.endDate ?? null,
        isOngoing:    payload.isOngoing ?? true,
        stoppedAt:    null,
        createdAt:    buildIsoNow(),
        updatedAt:    buildIsoNow(),
      };

      setMedications((prev) => [optimistic, ...prev]);

      try {
        const res = await fetch("/api/medications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const saved: MedicationEntity = await res.json();
          setMedications((prev) =>
            prev.map((m) => (m.id === tempId ? saved : m))
          );
        } else {
          // Roll back on failure
          setMedications((prev) => prev.filter((m) => m.id !== tempId));
        }
      } catch (err) {
        console.error(err);
        setMedications((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [user]
  );

  const stopMedication = useCallback((medicationId: string) => {
    // Optimistic update — mark as stopped immediately
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationId
          ? { ...m, status: "stopped" as const, stoppedAt: buildIsoNow(), updatedAt: buildIsoNow() }
          : m
      )
    );
    fetch(`/api/medications/${medicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "stopped" }),
    }).catch(console.error);
  }, []);

  const removeMedication = useCallback((medicationId: string) => {
    // Hard-delete (accidental entry)
    setMedications((prev) => prev.filter((m) => m.id !== medicationId));
    fetch(`/api/medications/${medicationId}`, { method: "DELETE" }).catch(
      console.error
    );
  }, []);

  const updateUserProfile = useCallback(
    (payload: UpdateUserProfileRequestDto) => {
      setUser((prev): UserEntity | null => {
        if (!prev) return null;
        return {
          id:        prev.id,
          firstName: payload.firstName.trim(),
          lastName:  payload.lastName.trim(),
          email:     payload.email.trim().toLowerCase(),
          role:      payload.role,
        };
      });
    },
    []
  );

  const deleteAccount = useCallback(() => {
    setMedications([]);
    setInteractions([]);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        firstName: "Deleted",
        lastName:  "User",
        email:     "deleted@safedose.local",
        role:      "patient",
      };
    });
  }, []);

  // ── Caregiver actions ─────────────────────────────────────────────────────

  const addPatient = useCallback(
    async (
      payload: CreatePatientRequestDto | LinkPatientRequestDto
    ): Promise<RosterPatient | null> => {
      try {
        const res = await fetch("/api/caregiver/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return null;
        // Refresh the full dashboard so status computations stay accurate
        await refreshCaregiverDashboard();
        return await res.json();
      } catch (err) {
        console.error(err);
        return null;
      }
    },
    [refreshCaregiverDashboard]
  );

  const removePatient = useCallback(
    async (patientId: string) => {
      // Optimistic remove from local roster
      setCaregiverDashboard((prev) => {
        if (!prev) return prev;
        const roster = prev.roster.filter((p) => p.patientId !== patientId);
        return {
          ...prev,
          roster,
          summary: {
            ...prev.summary,
            totalPatients: roster.length,
            patientsOnTrack: roster.filter((p) => p.rosterStatus === "ok").length,
            patientsWithAlerts: roster.filter((p) => p.rosterStatus === "alert").length,
            patientsWithWarnings: roster.filter((p) => p.rosterStatus === "warning").length,
          },
        };
      });

      try {
        await fetch(`/api/caregiver/patients/${patientId}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error(err);
        // Refresh to restore accurate state if the request failed
        await refreshCaregiverDashboard();
      }
    },
    [refreshCaregiverDashboard]
  );

  // ── Context value ─────────────────────────────────────────────────────────

  const value = useMemo<AppStateContextValue>(
    () => ({
      user,
      isAuthLoading,
      medications,
      interactions,
      caregiverDashboard,
      isCaregiverLoading,
      toggleDose,
      addMedication,
      stopMedication,
      removeMedication,
      updateUserProfile,
      deleteAccount,
      refreshCaregiverDashboard,
      addPatient,
      removePatient,
    }),
    [
      user,
      isAuthLoading,
      medications,
      interactions,
      caregiverDashboard,
      isCaregiverLoading,
      toggleDose,
      addMedication,
      stopMedication,
      removeMedication,
      updateUserProfile,
      deleteAccount,
      refreshCaregiverDashboard,
      addPatient,
      removePatient,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}

// ─── Role-scoped convenience hooks ───────────────────────────────────────────

/** Use inside patient-only pages. Throws if called outside patient context. */
export function usePatientState() {
  const ctx = useAppState();
  return {
    user:             ctx.user,
    isAuthLoading:    ctx.isAuthLoading,
    medications:      ctx.medications,
    interactions:     ctx.interactions,
    toggleDose:  ctx.toggleDose,
    addMedication:    ctx.addMedication,
    stopMedication:   ctx.stopMedication,
    removeMedication: ctx.removeMedication,
    updateUserProfile:ctx.updateUserProfile,
    deleteAccount:    ctx.deleteAccount,
  };
}

/** Use inside caregiver-only pages. */
export function useCaregiverState() {
  const ctx = useAppState();
  return {
    user:                     ctx.user,
    isAuthLoading:            ctx.isAuthLoading,
    caregiverDashboard:       ctx.caregiverDashboard,
    isCaregiverLoading:       ctx.isCaregiverLoading,
    refreshCaregiverDashboard:ctx.refreshCaregiverDashboard,
    addPatient:               ctx.addPatient,
    removePatient:            ctx.removePatient,
    updateUserProfile:        ctx.updateUserProfile,
    deleteAccount:            ctx.deleteAccount,
  };
}
