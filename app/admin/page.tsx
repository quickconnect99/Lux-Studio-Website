import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminErrorBoundary } from "@/components/admin/admin-error-boundary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Simple CMS-style admin area for managing automotive and hospitality portfolio projects.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const isAdminEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_ADMIN_DEMO === "true" ||
    (process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true" && isSupabaseConfigured);

  if (!isAdminEnabled) {
    notFound();
  }

  return (
    <main
      data-admin-workspace
      className="admin-theme-surface min-h-screen bg-background"
    >
      <AdminErrorBoundary>
        <AdminDashboard />
      </AdminErrorBoundary>
    </main>
  );
}
