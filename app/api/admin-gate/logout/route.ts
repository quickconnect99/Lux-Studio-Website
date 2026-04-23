import { NextResponse } from "next/server";
import { ADMIN_GATE_COOKIE } from "@/lib/admin-gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: ADMIN_GATE_COOKIE,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/admin",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
