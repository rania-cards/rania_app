"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Heart, Zap, Video } from "lucide-react";

export default function MarketingHomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrameId: number;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: ["#10b981", "#06b6d4", "#ec4899"][
          Math.floor(Math.random() * 3)
        ],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 opacity-40"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Gradient Orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute top-1/3 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "5s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 md:px-8 py-16 md:py-24 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                  <span className="block text-white">Turn your</span>
                  <span className="block bg-linear-to-r from-emerald-300 via-cyan-300 to-purple-400 text-transparent bg-clip-text animate-pulse">
                    feelings
                  </span>
                  <span className="block text-white">into moments</span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-xl md:text-2xl text-slate-200 max-w-lg leading-relaxed font-light">
                Say what matters in a way they&apos;ll never forget. Express gratitude, encouragement, or just check in.
              </p>

              {/* CTA Button - Prominent */}
              <Link
                href="/create/moment"
                className="group relative inline-block pt-4"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 group-hover:blur-2xl transition duration-500 animate-pulse" />
                <div className="relative flex items-center justify-center gap-3 px-10 py-5 bg-black rounded-full border-2 border-emerald-400/50 group-hover:border-emerald-400 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/50 group-hover:scale-110">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  <span className="text-xl font-bold text-emerald-300">Create Your Moment</span>
                </div>
              </Link>

              {/* Social Proof / Features */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="p-4 rounded-lg bg-white/5 border border-emerald-500/20 hover:border-emerald-500/50 transition">
                  <div className="text-2xl font-black text-emerald-400 mb-1">100%</div>
                  <div className="text-xs text-slate-400">Free to Start</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-cyan-500/20 hover:border-cyan-500/50 transition">
                  <div className="text-2xl font-black text-cyan-400 mb-1">30s</div>
                  <div className="text-xs text-slate-400">Create Instantly</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-purple-500/20 hover:border-purple-500/50 transition">
                  <div className="text-2xl font-black text-purple-400 mb-1">∞</div>
                  <div className="text-xs text-slate-400">Endless Moments</div>
                </div>
              </div>
            </div>

            {/* Right - 3D Card Preview */}
            <div className="relative h-96 md:h-full min-h-screen md:min-h-96 hidden lg:flex items-center justify-center">
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px) rotateX(0deg) rotateY(-15deg); }
                  50% { transform: translateY(-30px) rotateX(8deg) rotateY(-15deg); }
                }
                @keyframes shimmer {
                  0%, 100% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                }
                @keyframes glow-pulse {
                  0%, 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.3); }
                  50% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.6); }
                }
                .card-3d {
                  animation: float 8s ease-in-out infinite;
                  transform-style: preserve-3d;
                  perspective: 1000px;
                }
                .shimmer-bg {
                  background-size: 200% 200%;
                  animation: shimmer 3s ease-in-out infinite;
                }
                .glow-card {
                  animation: glow-pulse 3s ease-in-out infinite;
                }
              `}</style>

              {/* Glowing Background */}
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/25 via-purple-500/25 to-pink-500/25 rounded-3xl blur-3xl" />

              {/* 3D Card */}
              <div className="card-3d relative w-full max-w-sm">
                <div className="shimmer-bg absolute
                  -inset-1 bg-linear-to-r from-emerald-600 via-purple-600 to-pink-600 rounded-2xl opacity-75 blur-lg" />

                <div className="glow-card relative bg-slate-950/95 backdrop-blur-xl rounded-2xl p-8 border
                 border-white/20 space-y-6">
                  {/* Card examples */}
                  <div className="space-y-4">
                    <div className="group p-5
                     rounded-xl bg-linear-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30
                      hover:border-emerald-500/70 transition-all duration-300 cursor-pointer 
                       transform hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-emerald-400" />
                        <p className="text-xs font-bold text-emerald-300 uppercase">Gratitude</p>
                      </div>
                      <p className="text-sm text-white leading-relaxed">
                        &quot;Thank you for being my anchor in the storm&quot;
                      </p>
                    </div>

                    <div className="group p-5 rounded-xl bg-linear-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-500/30 hover:border-cyan-500/70 transition-all duration-300 cursor-pointer transform hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <p className="text-xs font-bold text-cyan-300 uppercase">Encouragement</p>
                      </div>
                      <p className="text-sm text-white leading-relaxed">
                        &quot;You&apos;ve got this. I believe in you completely&quot;
                      </p>
                    </div>

                    <div className="group p-5 rounded-xl bg-linear-to-br from-purple-500/15 to-purple-500/5 border border-purple-500/30 hover:border-purple-500/70 transition-all duration-300 cursor-pointer transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-purple-400" />
                        <p className="text-xs font-bold text-purple-300 uppercase">Video Moment</p>
                      </div>
                      <p className="text-sm text-white leading-relaxed">
                        &quot;Your message becomes an 8-12s video they&apos;ll treasure&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}