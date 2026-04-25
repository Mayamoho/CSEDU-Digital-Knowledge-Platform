"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Calendar, User, Download, Eye } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ResearchItem {
  item_id: string;
  title: string;
  item_type: string;
  format: string;
  status: string;
  access_tier: string;
  created_by: string | null;
  upload_date: string;
  file_path: string | null;
  metadata?: {
    abstract: string;
    keywords: string[];
    tags?: string[];
  };
}

function ResearchGridInner() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [total, setTotal] = useState(0);

  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 12;

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getMediaItems({
          q: query || undefined,
          item_type: "research",
          page,
          per_page: perPage,
        });

        // Transform API response to ResearchItem format
        const researchItems: ResearchItem[] = response.data.map((item) => ({
          ...item,
          metadata: {
            abstract: item.metadata?.abstract || "",
            keywords: item.metadata?.keywords || [],
            tags: item.metadata?.keywords || [], // Use keywords as tags for now
          },
        }));

        setItems(researchItems);
        setTotal(response.total);
      } catch (error) {
        console.error("Failed to fetch research papers:", error);
        setItems([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [query, sortBy, page]);

  const totalPages = Math.ceil(total / perPage);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <FileText className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No research found</EmptyTitle>
        <EmptyDescription>
          {query
            ? `No research matches "${query}". Try adjusting your search or filters.`
            : "No research matches your current filters."}
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {items.length} of {total} research papers
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="year">Year</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="citations">Citations</SelectItem>
            <SelectItem value="downloads">Downloads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.item_id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline">
                  {item.item_type === 'research' ? 'Research Paper' : item.item_type}
                </Badge>
              </div>
              <h3 className="mt-3 font-semibold leading-tight line-clamp-2">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {item.metadata?.abstract || "No abstract available"}
              </p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{item.created_by || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(item.upload_date).toLocaleDateString()} - {item.format.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    <span>{item.access_tier}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{item.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1 mb-3">
                {item.metadata?.keywords && item.metadata.keywords.length > 0 ? (
                  <>
                    {item.metadata.keywords.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.metadata.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.metadata.keywords.length - 3}
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    No tags
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/research/${item.item_id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}

export function ResearchGrid() {
  return (
    <Suspense fallback={<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse bg-muted rounded" />
        <div className="h-10 w-40 animate-pulse bg-muted rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse bg-muted rounded" />
        ))}
      </div>
    </div>}>
      <ResearchGridInner />
    </Suspense>
  );
}
