// src/app/interactions/page.tsx
import { redirect } from "next/navigation";

export default function InteractionsRedirect() {
  redirect("/patient-dashboard/interactions");
}
