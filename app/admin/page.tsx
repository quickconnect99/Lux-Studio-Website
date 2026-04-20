import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminErrorBoundary } from "@/components/admin/admin-error-boundary";
import { PageHeader } from "@/components/sections/page-header";

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
    (process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true" && isSupabaseConfigured);

  if (!isAdminEnabled) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Project management"
        lead="Admin"
        trail="Workspace"
        copy="A simple Supabase-ready CMS surface for editing project metadata, swapping media, and controlling publish state."
      />
      <AdminErrorBoundary>
        <AdminDashboard />
      </AdminErrorBoundary>
    </>
  );
}
