"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  Upload,
  FileText,
  Clock,
  AlertTriangle,
  ArrowRight,
  Library,
  Bot,
  FolderOpen,
  User,
  Calendar,
  Info,
} from "lucide-react";
import { ROLE_DISPLAY_NAMES, type RoleTier } from "@/lib/types";

// Mock data - Replace with actual API calls
const mockLoans = [
  {
    loan_id: "1",
    title: "Introduction to Algorithms",
    checkout_date: "2026-04-01",
    due_date: "2026-04-15",
    status: "active",
  },
  {
    loan_id: "2",
    title: "Design Patterns",
    checkout_date: "2026-03-20",
    due_date: "2026-04-03",
    status: "overdue",
  },
];

const mockRecentUploads = [
  {
    item_id: "1",
    title: "Machine Learning Research Paper",
    upload_date: "2026-04-10",
    status: "published",
  },
  {
    item_id: "2",
    title: "Database Design Notes",
    upload_date: "2026-04-08",
    status: "review",
  },
];

interface DashboardStats {
  activeLoans: number;
  overdueLoans: number;
  uploads: number;
  totalFines: number;
}

export function DashboardContent() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStats({
        activeLoans: 2,
        overdueLoans: 1,
        uploads: 5,
        totalFines: 50,
      });
      setIsLoading(false);
    };

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container max-w-4xl px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please <Link href="/login" className="font-medium text-primary hover:underline">sign in</Link> to view your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s an overview of your activity
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            {ROLE_DISPLAY_NAMES[user.role_tier as RoleTier]}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Active Loans"
          value={isLoading ? null : stats?.activeLoans ?? 0}
          icon={BookOpen}
          href="/loans"
        />
        <StatsCard
          title="Overdue Items"
          value={isLoading ? null : stats?.overdueLoans ?? 0}
          icon={AlertTriangle}
          variant={stats?.overdueLoans ? "destructive" : "default"}
          href="/loans?status=overdue"
        />
        <StatsCard
          title="My Uploads"
          value={isLoading ? null : stats?.uploads ?? 0}
          icon={Upload}
          href="/my-uploads"
        />
        <StatsCard
          title="Outstanding Fines"
          value={isLoading ? null : `${stats?.totalFines ?? 0} BDT`}
          icon={Clock}
          variant={stats?.totalFines ? "warning" : "default"}
          href="/fines"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickActionButton
                href="/catalog"
                icon={Library}
                label="Browse Catalog"
                description="Search library resources"
              />
              <QuickActionButton
                href="/upload"
                icon={Upload}
                label="Upload Media"
                description="Share documents"
              />
              <QuickActionButton
                href="/ai-chat"
                icon={Bot}
                label="AI Assistant"
                description="Ask questions"
              />
              <QuickActionButton
                href="/research"
                icon={FileText}
                label="Research Repository"
                description="Explore papers"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Loans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Loans</CardTitle>
              <CardDescription>Books and resources you&apos;ve borrowed</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/loans">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mockLoans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No active loans
              </p>
            ) : (
              <div className="space-y-3">
                {mockLoans.map((loan) => (
                  <div
                    key={loan.loan_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{loan.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(loan.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={loan.status === "overdue" ? "destructive" : "secondary"}
                    >
                      {loan.status === "overdue" ? "Overdue" : "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Uploads</CardTitle>
              <CardDescription>Your recently uploaded content</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/my-uploads">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mockRecentUploads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No uploads yet
              </p>
            ) : (
              <div className="space-y-3">
                {mockRecentUploads.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                        <FolderOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={item.status === "published" ? "default" : "secondary"}
                    >
                      {item.status === "published" ? "Published" : "In Review"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon: Icon,
  href,
  variant = "default",
}: {
  title: string;
  value: string | number | null;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  variant?: "default" | "destructive" | "warning";
}) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-amber-500/10 text-amber-600",
  };

  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${variantStyles[variant]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              {value === null ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-semibold">{value}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
