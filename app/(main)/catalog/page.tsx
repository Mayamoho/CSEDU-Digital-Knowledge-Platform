import type { Metadata } from "next";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { CatalogFilters } from "@/components/catalog/catalog-filters";

export const metadata: Metadata = {
  title: "Library Catalog",
  description: "Browse and search the CSEDU library catalog. Find books, journals, and academic resources.",
};

export default function CatalogPage() {
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Library Catalog
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse and search our collection of books, journals, and academic resources.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <CatalogSearch />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-64 shrink-0">
            <CatalogFilters />
          </aside>
          
          <div className="flex-1">
            <CatalogGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
