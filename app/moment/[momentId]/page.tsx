/* eslint-disable @typescript-eslint/no-explicit-any */
// app/moment/[momentId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader, Share2, Heart, ArrowLeft } from "lucide-react";

interface Moment {
  id: string;
  user_id: string;
  receiver_name: string | null;
  occasion: string | null;
  relationship: string | null;
  tone: string | null;
  message_text: string | null;
  delivery_type: string;
  is_premium: boolean;
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
        <div className="text-center space-y-6">
          <div className="text-7xl">😢</div>
          <div>
            <h1 className="text-4xl font-black mb-2">Moment Not Found</h1>
            <p className="text-slate-300">
              {error || "This moment has been removed or never existed."}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 font-semibold rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </Link>
            <Link
              href="/create/moment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-lg hover:shadow-lg transition"
            >
              <Heart className="w-4 h-4" />
              Create Moment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shareOnWhatsApp = () => {
    const text = `✨ Check out my moment on RANIA: ${typeof window !== "undefined" ? window.location.href : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to RANIA
          </Link>
        </div>

        {/* Moment Card */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 space-y-6">
          {/* For Section */}
          <div className="text-center space-y-2">
            <p className="text-slate-400 text-sm uppercase tracking-wider">For</p>
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              {moment.receiver_name || "Someone Special"}
            </h1>
            {moment.occasion && (
              <p className="text-xl text-slate-300 mt-2">{moment.occasion}</p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

          {/* Message */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-xl p-8">
            <p className="text-center text-2xl leading-relaxed text-slate-50 font-semibold">
              {moment.message_text}
            </p>
          </div>

          {/* Meta Information */}
          <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-slate-700">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Relationship</p>
              <p className="text-slate-100 font-semibold capitalize">
                {moment.relationship || "—"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm">Type</p>
              <p className="text-slate-100 font-semibold">
                {moment.delivery_type === "text" ? "📝 Text" : "💎 Premium"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm">Created</p>
              <p className="text-slate-100 font-semibold">
                {new Date(moment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              onClick={shareOnWhatsApp}
              className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="flex-1 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold transition"
            >
              📋 Copy Link
            </button>
          </div>

          {/* Create Another */}
          <Link
            href="/create/moment"
            className="block w-full py-3 rounded-lg border-2 border-emerald-500 text-emerald-400 font-bold hover:bg-emerald-500/20 transition text-center"
          >
            ✨ Create Your Own Moment
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Moments are the best way to say what matters most
          </p>
        </div>
      </div>
    </div>
  );
}