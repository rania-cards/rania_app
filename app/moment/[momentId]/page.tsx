/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Share2, Heart } from "lucide-react";
import Link from "next/link";

export default function MomentViewPage() {
  const params = useParams();
  const momentId = params.momentId as string;
  const [moment, setMoment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMoment = async () => {
      try {
        const response = await fetch(`/api/moments/${momentId}`);
        if (!response.ok) throw new Error("Moment not found");
        const data = await response.json();
        setMoment(data.moment);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (momentId) {
      fetchMoment();
    }
  }, [momentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading moment...</p>
        </div>
      </div>
    );
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl font-bold mb-2">😔 Moment not found</p>
          <p className="text-slate-400 mb-6">{error || "This moment may have been deleted"}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition"
          >
            Create Your Own Moment
          </Link>
        </div>
      </div>
    );
  }

  const shareOnWhatsApp = () => {
    const text = `✨ Check out this beautiful moment: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const downloadMoment = () => {
    // For now, just copy link
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">A Moment for You</h1>
          <p className="text-slate-400">Created with 💚 on RANIA</p>
        </div>

        {/* Moment Card */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/50 rounded-2xl p-8 mb-8">
          <div className="text-center">
            {/* Icon */}
            <Heart className="w-12 h-12 text-emerald-400 mx-auto mb-6" />

            {/* Message */}
            <p className="text-2xl md:text-3xl leading-relaxed mb-8 text-slate-50">
              {moment.message_text}
            </p>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase">To</p>
                <p className="font-semibold">{moment.receiver_name || "Someone Special"}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase">Occasion</p>
                <p className="font-semibold">{moment.occasion || "Special Day"}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase">Relationship</p>
                <p className="font-semibold">{moment.relationship || "Dear"}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-slate-500 text-xs uppercase">Tone</p>
                <p className="font-semibold capitalize">{moment.tone || "Warm"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={shareOnWhatsApp}
            className="py-3 rounded-lg bg-green-600 hover:bg-green-700 font-bold transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
          <button
            onClick={downloadMoment}
            className="py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Copy Link
          </button>
        </div>

        {/* Create Your Own */}
        <div className="text-center">
          <p className="text-slate-400 mb-4">Want to create your own moment?</p>
          <a
            href="/create/moment"
            className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition"
          >
            Start Creating
          </a>
        </div>
      </div>
    </div>
  );
}