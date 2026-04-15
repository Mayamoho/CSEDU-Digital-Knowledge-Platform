"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty } from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, BookMarked, Calendar, User, Search } from "lucide-react";
import { CatalogPagination } from "./catalog-pagination";

// Mock data for demonstration - Replace with actual API call
const mockCatalogItems = [
  {
    item_id: "1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson",
    isbn: "978-0262033848",
    format: "book",
    status: "available" as const,
    location: "Section A, Shelf 3",
    cover_image: null,
    year: 2009,
  },
  {
    item_id: "2",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm",
    isbn: "978-0201633610",
    format: "book",
    status: "borrowed" as const,
    location: "Section B, Shelf 1",
    cover_image: null,
    year: 1994,
  },
  {
    item_id: "3",
    title: "Machine Learning: A Probabilistic Perspective",
    author: "Kevin P. Murphy",
    isbn: "978-0262018029",
    format: "book",
    status: "available" as const,
    location: "Section C, Shelf 2",
    cover_image: null,
    year: 2012,
  },
  {
    item_id: "4",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    isbn: "978-0136042594",
    format: "book",
    status: "reserved" as const,
    location: "Section C, Shelf 1",
    cover_image: null,
    year: 2020,
  },
  {
    item_id: "5",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    isbn: "978-0132126953",
    format: "book",
    status: "available" as const,
    location: "Section D, Shelf 4",
    cover_image: null,
    year: 2010,
  },
  {
    item_id: "6",
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth",
    isbn: "978-0073523323",
    format: "book",
    status: "available" as const,
    location: "Section A, Shelf 5",
    cover_image: null,
    year: 2019,
  },
  {
    item_id: "7",
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    isbn: "978-1118063330",
    format: "book",
    status: "borrowed" as const,
    location: "Section B, Shelf 3",
    cover_image: null,
    year: 2018,
  },
  {
    item_id: "8",
    title: "Computer Architecture: A Quantitative Approach",
    author: "John L. Hennessy, David A. Patterson",
    isbn: "978-0128119051",
    format: "book",
    status: "available" as const,
    location: "Section D, Shelf 1",
    cover_image: null,
    year: 2017,
  },
];

interface CatalogItem {
  item_id: string;
  title: string;
  author: string;
  isbn: string;
  format: string;
  status: "available" | "borrowed" | "reserved";
  location: string;
  cover_image: string | null;
  year: number;
}

const statusConfig = {
  available: { label: "Available", variant: "default" as const },
  borrowed: { label: "Borrowed", variant: "secondary" as const },
  reserved: { label: "Reserved", variant: "outline" as const },
};

export function CatalogGrid() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("title");

  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = 12;

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredItems = [...mockCatalogItems];

      // Filter by search query
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredItems = filteredItems.filter(
          (item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.author.toLowerCase().includes(lowerQuery) ||
            item.isbn.includes(query)
        );
      }

      // Sort items
      filteredItems.sort((a, b) => {
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "author":
            return a.author.localeCompare(b.author);
          case "year":
            return b.year - a.year;
          default:
            return 0;
        }
      });

      setItems(filteredItems);
      setIsLoading(false);
    };

    fetchItems();
  }, [query, sortBy, page]);

  const totalPages = Math.ceil(items.length / perPage);
  const paginatedItems = items.slice((page - 1) * perPage, page * perPage);

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
                <Skeleton className="h-4 w-1/2" />
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
      <Empty
        icon={Search}
        title="No results found"
        description={
          query
            ? `No items match "${query}". Try adjusting your search or filters.`
            : "No items in the catalog match your filters."
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedItems.length} of {items.length} results
        </p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedItems.map((item) => (
          <Card key={item.item_id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={statusConfig[item.status].variant}>
                  {statusConfig[item.status].label}
                </Badge>
              </div>
              <h3 className="mt-3 font-semibold leading-tight line-clamp-2">
                {item.title}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{item.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{item.year}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookMarked className="h-3.5 w-3.5" />
                <span>{item.location}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/catalog/${item.item_id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <CatalogPagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
