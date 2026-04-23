import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminGateLoginForm } from "@/components/admin/admin-gate-login-form";
import { PageHeader } from "@/components/sections/page-header";
import {
  ADMIN_GATE_COOKIE,
  isAdminGateEnabled,
  verifyAdminGateCookieValue
} from "@/lib/admin-gate";

export const metadata: Metadata = {
  title: "Admin Access",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage() {
  if (!isAdminGateEnabled()) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const hasSession = await verifyAdminGateCookieValue(
    cookieStore.get(ADMIN_GATE_COOKIE)?.value
  );

  if (hasSession) {
    redirect("/admin");
  }

  return (
    <>
      <PageHeader
        eyebrow="Protected route"
        lead="Admin"
        trail="Access"
        copy="Enter the internal access credentials to continue to the protected admin area."
      />

      <section className="section-shell pb-20">
        <AdminGateLoginForm />
      </section>
    </>
  );
}
