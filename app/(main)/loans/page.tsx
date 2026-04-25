import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "My Loans",
  description: "View and manage your library loans and borrow history.",
};

export default function LoansPage() {
  return (
    <AuthGuard requireAuth>
      <div className="container max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Loans
          </h1>
          <p className="mt-2 text-muted-foreground">
            View your current loans, due dates, and borrowing history.
          </p>
        </div>

        <div className="space-y-8">
          {/* Current Loans */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Current Loans</h2>
            <p className="text-muted-foreground">
              Your active library loans will appear here. You'll be able to see due dates, 
              renewal options, and return status for all borrowed items.
            </p>
          </div>

          {/* Loan History */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Borrowing History</h2>
            <p className="text-muted-foreground">
              Your complete borrowing history will be available here. Track past loans, 
              view return dates, and access your library activity records.
            </p>
          </div>

          {/* Fines */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Fines & Fees</h2>
            <p className="text-muted-foreground">
              Any outstanding fines or fees will be displayed here. Payment options and 
              fine details will be available in the next update.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
