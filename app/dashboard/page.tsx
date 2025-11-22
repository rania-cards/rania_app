import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please sign in to view your moments.</div>;
  }

  const { data: moments } = await supabase
    .from("moments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Moments</h1>
      {!moments?.length && <p>No moments yet.</p>}
      <ul className="space-y-3">
        {moments?.map((m) => (
          <li key={m.id} className="border rounded-md p-3">
            <div className="text-sm text-gray-500">{m.occasion} • {m.relationship}</div>
            <div className="font-medium truncate">{m.message_text}</div>
            <div className="mt-2 flex gap-3 text-sm">
              {m.video_url && <a href={m.video_url} target="_blank">View Video</a>}
              <a href={`/moment/${m.id}`} target="_blank">View Public Link</a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}