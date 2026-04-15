import type { Metadata } from "next";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadPageClient } from "./upload-client";

export const metadata: Metadata = {
  title: "Upload Media",
  description: "Upload documents, research papers, and media files to the CSEDU Digital Knowledge Platform.",
};

export default function UploadPage() {
  return <UploadPageClient />;
}
