import { redirect } from "next/navigation";

/** Legacy app route — analytics lives under `/admin/dashboard`. */
export default function DashboardPage() {
  redirect("/admin/dashboard");
}
