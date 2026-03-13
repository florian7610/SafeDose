"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import medicationsJson from "@/data/medications.json";
import interactionsJson from "@/data/interactions.json";
import userJson from "@/data/user.json";
import type {
  CreateMedicationRequestDto,
  InteractionEntity,
  MedicationEntity,
  UpdateUserProfileRequestDto,
  UserEntity,
} from "@/types/contracts";

interface AppStateContextValue {
  user: UserEntity;
  medications: MedicationEntity[];
  interactions: InteractionEntity[];
  toggleDoseTaken: (medicationId: string) => void;
  addMedication: (payload: CreateMedicationRequestDto) => void;
  removeMedication: (medicationId: string) => void;
  updateUserProfile: (payload: UpdateUserProfileRequestDto) => void;
  deleteAccount: () => void;
}

const initialMeds = medicationsJson as Omit<
  MedicationEntity,
  "userId" | "createdAt" | "updatedAt"
>[];
const initialInteractions = interactionsJson as Omit<
  InteractionEntity,
  "userId" | "createdAt"
>[];
const mockUser = userJson as UserEntity;

const AppStateContext = createContext<AppStateContextValue | null>(null);

function buildIsoNow() {
  return new Date().toISOString();
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserEntity>(mockUser);

  const [medications, setMedications] = useState<MedicationEntity[]>(
    initialMeds.map((med) => ({
      ...med,
      userId: user.id,
      createdAt: buildIsoNow(),
      updatedAt: buildIsoNow(),
    })),
  );

  const [interactions, setInteractions] = useState<InteractionEntity[]>(
    initialInteractions.map((interaction) => ({
      ...interaction,
      userId: user.id,
      createdAt: buildIsoNow(),
    })),
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      user,
      medications,
      interactions,
      toggleDoseTaken: (medicationId: string) => {
        setMedications((prev) =>
          prev.map((med) =>
            med.id === medicationId
              ? {
                  ...med,
                  takenToday: !med.takenToday,
                  updatedAt: buildIsoNow(),
                }
              : med,
          ),
        );
      },
      addMedication: (payload: CreateMedicationRequestDto) => {
        setMedications((prev) => [
          {
            id: `med-${crypto.randomUUID().slice(0, 8)}`,
            userId: user.id,
            name: payload.name,
            genericName: payload.genericName,
            dosage: payload.dosage,
            frequency: payload.frequency,
            scheduleTime: payload.scheduleTime,
            status: "active",
            rxcui: payload.rxcui,
            takenToday: false,
            createdAt: buildIsoNow(),
            updatedAt: buildIsoNow(),
          },
          ...prev,
        ]);
      },
      removeMedication: (medicationId: string) => {
        setMedications((prev) => prev.filter((med) => med.id !== medicationId));
      },
      updateUserProfile: (payload: UpdateUserProfileRequestDto) => {
        setUser((prev) => ({
          ...prev,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          email: payload.email.trim().toLowerCase(),
          role: payload.role,
        }));
      },
      deleteAccount: () => {
        setMedications([]);
        setInteractions([]);
        setUser((prev) => ({
          ...prev,
          firstName: "Deleted",
          lastName: "User",
          email: "deleted@safedose.local",
          role: "patient",
        }));
      },
    }),
    [interactions, medications, user],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
