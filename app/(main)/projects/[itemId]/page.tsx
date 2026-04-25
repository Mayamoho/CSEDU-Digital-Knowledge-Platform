import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MediaDetailView } from "@/components/media/media-detail-view";

export const metadata: Metadata = {
  title: "Student Project",
  description: "View student project details",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  
  return (
    <AuthGuard requireAuth>
      <MediaDetailView itemId={itemId} itemType="project" />
    </AuthGuard>
  );
}
