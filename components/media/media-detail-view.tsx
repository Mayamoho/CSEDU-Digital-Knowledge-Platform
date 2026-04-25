"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Tag, 
  AlertCircle,
  ArrowLeft 
} from "lucide-react";

interface MediaDetailViewProps {
  itemId: string;
  itemType: string;
}

export function MediaDetailView({ itemId, itemType }: MediaDetailViewProps) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getMediaItem(itemId);
      setItem(data);
    } catch (err) {
      console.error("Failed to load item:", err);
      setError(err instanceof Error ? err.message : "Failed to load item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { url } = await apiClient.getDownloadUrl(itemId);
      window.open(url, '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : "Download failed");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container max-w-4xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Item not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={
                  item.status === 'published' ? 'default' :
                  item.status === 'review' ? 'secondary' :
                  'outline'
                }>
                  {item.status}
                </Badge>
                <Badge variant="outline">{item.item_type}</Badge>
                <Badge variant="outline">{item.format.toUpperCase()}</Badge>
                <Badge variant="outline">{item.access_tier}</Badge>
              </div>
            </div>
            {item.file_path && (
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Uploaded: {new Date(item.upload_date).toLocaleDateString()}</span>
            </div>
            {item.created_by && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>By: {item.created_by}</span>
              </div>
            )}
          </div>

          {/* Abstract */}
          {item.metadata?.abstract && (
            <div>
              <h3 className="font-semibold mb-2">Abstract</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.metadata.abstract}
              </p>
            </div>
          )}

          {/* Keywords */}
          {item.metadata?.keywords && item.metadata.keywords.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.metadata.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.metadata?.tags && item.metadata.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.metadata.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Language */}
          {item.metadata?.language && (
            <div className="text-sm text-muted-foreground">
              Language: {item.metadata.language === 'en' ? 'English' : item.metadata.language === 'bn' ? 'বাংলা' : item.metadata.language}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
