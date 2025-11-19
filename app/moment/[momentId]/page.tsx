import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  getTemplateById,
  getDefaultTemplateForCategory,
  type TemplateCategory,
} from "@/lib/templates";
import type { RaniaMoment } from "@/types";

interface MomentPageProps {
  params: { momentId: string };
}

export default async function MomentReceiverPage({ params }: MomentPageProps) {
  const { momentId } =  await params;
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("id", momentId)
    .maybeSingle<RaniaMoment>();

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-50">
            This moment is not available
          </h1>
          <p className="text-slate-300 text-sm">
            It might have been deleted, or the link is incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
          >
            Go back to RANIA home
          </Link>
        </div>
      </div>
    );
  }

  const moment = data;

  const category = (moment.category as TemplateCategory) || "others";
  const template =
    (moment.template_id && getTemplateById(moment.template_id)) ||
    getDefaultTemplateForCategory(category);

  const backgroundStyle = {
    backgroundImage: `radial-gradient(circle at top left, ${template.gradientFrom}, transparent 55%), radial-gradient(circle at bottom right, ${template.gradientTo}, #020617)`,
  };

  const receiverName = moment.receiver_name || "Someone special";

  const referrerParam = encodeURIComponent(moment.user_id);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={backgroundStyle}
    >
      <div className="max-w-md w-full bg-slate-950/80 border border-slate-800/80 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700">
            <span className="text-lg">{template.icon}</span>
            <span className="text-xs text-slate-200">{template.name}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Powered by{" "}
            <span className="font-semibold text-emerald-300">RANIA</span>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            A moment for{" "}
            <span className="font-semibold text-slate-50">
              {receiverName}
            </span>
          </p>
          <div className="rounded-2xl bg-slate-900/80 px-3 py-3">
            <p className="text-sm text-slate-50 whitespace-pre-wrap">
              {moment.message_text ||
                "This moment text will appear here. The sender used RANIA to say something special."}
            </p>
            {moment.media_url && (
  <div className="mt-4">
    {moment.delivery_type === "user_voice" || moment.delivery_type === "kid_voice" ? (
      <audio
        controls
        className="w-full mt-2"
        src={moment.media_url}
      />
    ) : (
      <video
        controls
        className="w-full mt-2 rounded-2xl border border-slate-700"
        src={moment.media_url}
      />
    )}
  </div>
)}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Made with ❤️ on RANIA
        </p>

        <div className="pt-2 border-t border-slate-800 mt-2 space-y-3">
          <p className="text-sm text-slate-200 text-center">
            Loved this moment? Create your own in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/create/moment?referrer=${referrerParam}`}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
            >
              Create your own moment for FREE 😍
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-900 transition"
            >
              Explore RANIA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}