import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center navy-gradient">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: "linear-gradient(135deg, #c9a227, #e8c547)" }}>
            <span className="text-4xl">🐂</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Noble Studio</h1>
          <p className="text-sm" style={{ color: "#c9a227" }}>EHM Strategies — AI Video Production</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
