import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Called by the admin dashboard right after a successful project or
 * site-settings save. Verifies the caller's own Supabase session against
 * is_admin() (same RLS check the browser client already relies on for the
 * write itself) before busting the cache, so an expired or non-admin
 * session can't force-refresh the public site on demand.
 */
export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { message: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const accessToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!accessToken) {
    return NextResponse.json(
      { message: "Missing admin session." },
      { status: 401 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || isAdmin !== true) {
    return NextResponse.json(
      { message: "This session is not authorized to refresh the site." },
      { status: 403 }
    );
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true });
}
