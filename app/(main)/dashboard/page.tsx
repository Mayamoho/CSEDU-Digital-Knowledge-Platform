import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personal dashboard on the CSEDU Digital Knowledge Platform.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
