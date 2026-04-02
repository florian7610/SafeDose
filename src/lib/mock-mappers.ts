import type {
  DashboardStatViewModel,
  InteractionEntity,
  InteractionViewModel,
  MedicationEntity,
  MedicationViewModel,
} from "@/types/contracts";

export function toMedicationViewModel(med: MedicationEntity): MedicationViewModel {
  const badgeVariant = med.status === "interaction" ? "danger" : "safe";
  return {
    id: med.id,
    title: med.name,
    subtitle: `${med.dosage} · ${med.frequency}`,
    timeLabel: med.scheduleTime,
    badgeText: med.status === "interaction" ? "Interaction" : "Active",
    badgeVariant,
    takenToday: med.takenToday,
  };  
}

export function toInteractionViewModel(
  interaction: InteractionEntity,
  medsById: Map<string, MedicationEntity>,
): InteractionViewModel {
  const names = interaction.drugIds
    .map((id) => medsById.get(id)?.name)
    .filter((name): name is string => Boolean(name));

  return {
    id: interaction.id,
    pairLabel: names.join(" + "),
    severityLabel: interaction.severity,
    summary: interaction.summary,
    recommendation: interaction.recommendation,
    severityVariant:
      interaction.severity === "HIGH"
        ? "high"
        : interaction.severity === "MODERATE"
          ? "moderate"
          : "low",
    reviewed: interaction.reviewed,
  };
}

export function buildDashboardStats(
  meds: MedicationEntity[],
  interactions: InteractionEntity[],
): DashboardStatViewModel[] {
  const taken = meds.filter((med) => med.takenToday).length;
  const adherence = meds.length > 0 ? Math.round((taken / meds.length) * 100) : 0;

  return [
    {
      id: "stat-meds",
      label: "Active Medications",
      value: String(meds.length),
      trendLabel: "Data refreshed from app state",
      trendVariant: "neutral",
    },
    {
      id: "stat-adherence",
      label: "Today Adherence",
      value: `${adherence}%`,
      trendLabel: "Updated from today's activity",
      trendVariant: "up",
    },
    {
      id: "stat-alerts",
      label: "Active Interactions",
      value: String(interactions.filter((item) => !item.reviewed).length),
      trendLabel: "Review suggested",
      trendVariant: "down",
    },
    {
      id: "stat-doses",
      label: "Doses Pending",
      value: String(meds.filter((med) => !med.takenToday).length),
      trendLabel: "Mark doses in dashboard",
      trendVariant: "neutral",
    },
  ];
}
