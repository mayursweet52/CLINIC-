"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

export function FloatingDemoWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 🌟 5-STAR FEATURE: Floating Glassmorphism Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-3 bg-slate-900/85 dark:bg-slate-900/90 text-white backdrop-blur-xl border border-white/20 p-2 pr-5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:scale-105 hover:bg-slate-900 transition-all duration-300 group cursor-pointer"
          title="Watch AI Demo Video"
        >
          {/* Glowing Pulse Animation */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-pink-500 to-purple-500"></span>
          </span>

          {/* Avatar / Icon Container */}
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 shadow-inner">
            <Sparkles className="w-5 h-5 text-pink-300 animate-pulse" />
          </div>

          <span className="text-white text-sm font-semibold tracking-wide flex items-center gap-1.5">
            Watch AI Demo <span className="text-pink-400">✨</span>
          </span>
        </button>
      </div>

      {/* 🌟 Glassmorphism Modal with Backdrop Blur */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
          {/* Blurred Backdrop */}
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-xl transition-all"
            onClick={() => setIsOpen(false)}
          />

          {/* Video Container */}
          <div className="relative z-10 w-full max-w-[360px] aspect-[9/16] bg-black rounded-[2rem] shadow-[0_0_50px_rgba(236,72,153,0.35)] border border-white/15 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-white/20 text-white backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/20"
              aria-label="Close demo video"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Reel / Video Iframe */}
            <iframe
              src="https://www.instagram.com/reel/Dbmcud4IexE/embed"
              className="w-full h-full"
              frameBorder="0"
              scrolling="no"
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
      )}
    </>
  );
}
