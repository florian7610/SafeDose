// src/app/meds/page.tsx
import { redirect } from "next/navigation";

export default function MedsRedirect() {
  redirect("/patient-dashboard/medications");
}
