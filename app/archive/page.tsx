import { redirect } from "next/navigation";

export default function LegacyArchivePage() {
  redirect("/dashboard/archive");
}
