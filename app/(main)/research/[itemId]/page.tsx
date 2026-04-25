import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MediaDetailView } from "@/components/media/media-detail-view";

export const metadata: Metadata = {
  title: "Research Paper",
  description: "View research paper details",
};

export default async function ResearchDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  
  return (
    <AuthGuard requireAuth>
      <MediaDetailView itemId={itemId} itemType="research" />
    </AuthGuard>
  );
}
