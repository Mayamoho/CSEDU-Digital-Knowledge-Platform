import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile information and account settings.",
};

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth>
      <div className="container max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <p className="text-muted-foreground">
              Profile management features coming soon. You'll be able to update your personal information, 
              change your password, and manage notification preferences here.
            </p>
          </div>

          {/* Account Settings */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
            <p className="text-muted-foreground">
              Account settings and privacy controls will be available here in the next update.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
