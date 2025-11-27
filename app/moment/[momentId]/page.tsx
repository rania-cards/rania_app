/* eslint-disable @typescript-eslint/no-explicit-any */
// app/moment/[momentId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader } from "lucide-react";

interface Moment {
  id: string;
  receiver_name: string | null;
  sender_name: string | null;
  occasion: string | null;
  message_text: string | null;
  delivery_type: "text" | "still" | "gif";
  media_url: string | null;
  created_at: string;
}

export default function MomentPage() {
  const params = useParams();
  const momentId = params?.momentId as string;

  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!momentId) return;

    const fetchMoment = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/moments/${momentId}`);

        if (!response.ok) {
          throw new Error("Moment not found");
        }

        const data = await response.json();
        setMoment(data.moment);
      } catch (err: any) {
        console.error("Error fetching moment:", err);
        setError(err.message || "Failed to load moment");
      } finally {
        setLoading(false);
      }
    };

    fetchMoment();
  }, [momentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <p className="text-slate-300">Loading moment...</p>
        </div>
      </div>
    );
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-7xl">😢</div>
          <div>
            <h1 className="text-4xl font-black mb-2">Moment Not Found</h1>
            <p className="text-slate-300">
              {error || "This moment has been removed or never existed."}
            </p>
          </div>
          <Link
            href="/create/moment"
            className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-lg hover:shadow-lg transition"
          >
            Create Your Moment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-emerald-400 text-sm uppercase tracking-wider font-semibold">
            A moment for
          </p>
          <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            {moment.receiver_name || "Someone Special"}
          </h1>
          {moment.occasion && (
            <p className="text-xl text-slate-300">
              {moment.occasion}
              {moment.sender_name && ` • from ${moment.sender_name}`}
            </p>
          )}
        </div>

        {/* Media Display */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950/50 backdrop-blur">
          {/* TEXT MOMENT */}
          {moment.delivery_type === "text" && moment.media_url && (
            <div className="w-full flex items-center justify-center">
              <img
                src={moment.media_url}
                alt="Text moment"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* STILL POSTER */}
          {moment.delivery_type === "still" && moment.media_url && (
            <div className="aspect-[9/16] w-full flex items-center justify-center">
              <img
                src={moment.media_url}
                alt="Spotlight Poster"
                className="w-full h-full object-cover"
              />
            </div>
          )}

        {moment.delivery_type === "gif" && moment.media_url && (
  <div className="aspect-[9/16] w-full flex items-center justify-center">
    <img
      src={moment.media_url}
      alt="Status Trio"
      className="w-full h-full object-cover"
    />
  </div>
)}

          {/* No media fallback */}
          {!moment.media_url && (
            <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <p className="text-slate-400">Media loading...</p>
            </div>
          )}
        </div>

        {/* Message Text */}
        {moment.message_text && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6">
            <p className="text-center text-lg leading-relaxed text-slate-100">
              &quot;{moment.message_text}&quot;
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/create/moment"
            className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition"
          >
            ✨ Create Your Moment
          </Link>
        </div>
      </div>
    </div>
  );
}