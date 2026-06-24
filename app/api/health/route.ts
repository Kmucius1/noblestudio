export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `set (${url.slice(0, 30)}...)` : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon ? `set (${anon.slice(0, 20)}...)` : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: service ? `set (${service.slice(0, 20)}...)` : "MISSING",
  };

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(url!, anon!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });

    const { data, error } = await supabase.from("noble_video_projects").select("count").limit(1);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    return NextResponse.json({
      env: envCheck,
      supabase_query: error ? `ERROR: ${error.message}` : "OK",
      auth: authError ? `ERROR: ${authError.message}` : user ? `user: ${user.email}` : "no session",
    });
  } catch (err) {
    return NextResponse.json({ env: envCheck, crash: String(err) }, { status: 500 });
  }
}
