"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import type {
  CreateMedicationRequestDto,
  InteractionEntity,
  MedicationEntity,
  UpdateUserProfileRequestDto,
  UserEntity,
} from "@/types/contracts";

interface AppStateContextValue {
  user: UserEntity | null;
  isAuthLoading: boolean;
  medications: MedicationEntity[];
  interactions: InteractionEntity[];
  toggleDoseTaken: (medicationId: string) => void;
  addMedication: (payload: CreateMedicationRequestDto) => void;
  removeMedication: (medicationId: string) => void;
  updateUserProfile: (payload: UpdateUserProfileRequestDto) => void;
  deleteAccount: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function buildIsoNow() {
  return new Date().toISOString();
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  const [medications, setMedications] = useState<MedicationEntity[]>([]);
  const [interactions, setInteractions] = useState<InteractionEntity[]>([]);

  useEffect(() => {
    if (!user) {
      setMedications([]);
      setInteractions([]);
      return;
    }

    const fetchData = async () => {
      try {
        const [medRes, intRes] = await Promise.all([
          fetch("/api/medications"),
          fetch("/api/interactions")
        ]);
        if (medRes.ok) setMedications(await medRes.json());
        if (intRes.ok) setInteractions(await intRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [user]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      user,
      isAuthLoading,
      medications,
      interactions,
      toggleDoseTaken: (medicationId: string) => {
        const med = medications.find(m => m.id === medicationId);
        if (!med) return;
        const newTakenState = !med.takenToday;

        setMedications((prev) =>
          prev.map((m) =>
            m.id === medicationId
              ? { ...m, takenToday: newTakenState, updatedAt: buildIsoNow() }
              : m,
          ),
        );

        fetch(`/api/medications/${medicationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ takenToday: newTakenState }),
        }).catch(err => console.error(err));
      },
      addMedication: async (payload: CreateMedicationRequestDto) => {
        if (!user) return;
        const tempId = `temp-${crypto.randomUUID().slice(0, 8)}`;
        const newMed = {
            id: tempId,
            userId: user.id,
            name: payload.name,
            genericName: payload.genericName,
            dosage: payload.dosage,
            frequency: payload.frequency,
            scheduleTime: payload.scheduleTime,
            status: "active" as const,
            rxcui: payload.rxcui,
            takenToday: false,
            createdAt: buildIsoNow(),
            updatedAt: buildIsoNow(),
        };

        setMedications((prev) => [newMed, ...prev]);

        try {
          const res = await fetch("/api/medications", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const savedMed = await res.json();
            setMedications(prev => prev.map(m => m.id === tempId ? savedMed : m));
          }
        } catch (err) {
          console.error(err);
          setMedications(prev => prev.filter(m => m.id !== tempId));
        }
      },
      removeMedication: (medicationId: string) => {
        setMedications((prev) => prev.filter((med) => med.id !== medicationId));
        fetch(`/api/medications/${medicationId}`, { method: 'DELETE' }).catch(err => console.error(err));
      },
      updateUserProfile: (payload: UpdateUserProfileRequestDto) => {
        setUser((prev): UserEntity | null => {
          if (!prev) return null;
          return {
            id: prev.id,
            firstName: payload.firstName.trim(),
            lastName: payload.lastName.trim(),
            email: payload.email.trim().toLowerCase(),
            role: payload.role,
          };
        });
      },
      deleteAccount: () => {
        setMedications([]);
        setInteractions([]);
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            firstName: "Deleted",
            lastName: "User",
            email: "deleted@safedose.local",
            role: "patient",
          };
        });
      },
    }),
    [interactions, medications, user, isAuthLoading],
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
