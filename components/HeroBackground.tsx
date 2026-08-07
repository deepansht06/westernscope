"use client";

import { useEffect, useRef } from "react";

/**
 * Animated, mouse-reactive backdrop for the landing hero.
 *
 * Layers (back to front): a deep-purple radial base, three blurred glow orbs
 * that float and parallax with the cursor, and a set of flowing SVG lines with
 * pulsing nodes. Purely decorative (aria-hidden), and all motion is disabled
 * under prefers-reduced-motion. No animation library — CSS keyframes (see
 * globals.css) plus a cheap rAF-throttled mousemove for the parallax.
 */
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el!.style.setProperty("--px", x.toFixed(3));
        el!.style.setProperty("--py", y.toFixed(3));
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [--px:0] [--py:0]"
    >
      {/* Deep purple base */}
      <div className="absolute inset-0 bg-western-950" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_15%_0%,#4f2683_0%,#2b1747_45%,#160b25_100%)]" />

      {/* Parallax glow orbs. Wrapper handles cursor parallax; inner div floats. */}
      <div
        className="absolute -left-24 -top-24 h-[28rem] w-[28rem]"
        style={{ transform: "translate(calc(var(--px)*40px), calc(var(--py)*40px))" }}
      >
        <div className="animate-hero-float h-full w-full rounded-full bg-western-500/40 blur-[90px]" />
      </div>
      <div
        className="absolute -right-32 top-1/4 h-[32rem] w-[32rem]"
        style={{ transform: "translate(calc(var(--px)*-60px), calc(var(--py)*-30px))" }}
      >
        <div className="animate-hero-drift h-full w-full rounded-full bg-western-400/30 blur-[100px]" />
      </div>
      <div
        className="absolute -bottom-40 left-1/3 h-[26rem] w-[26rem]"
        style={{ transform: "translate(calc(var(--px)*25px), calc(var(--py)*-40px))" }}
      >
        <div className="animate-hero-float h-full w-full rounded-full bg-western-700/50 blur-[80px]" />
      </div>

      {/* Flowing lines + nodes */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: "translate(calc(var(--px)*-18px), calc(var(--py)*-12px))" }}
      >
        <defs>
          <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b8a3da" stopOpacity="0" />
            <stop offset="50%" stopColor="#b8a3da" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8b66bd" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-line2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9670c4" stopOpacity="0" />
            <stop offset="55%" stopColor="#d5c9e9" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#9670c4" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          className="animate-hero-flow"
          d="M-60 170 C 320 40, 520 300, 840 200 S 1320 110, 1520 250"
          stroke="url(#hero-line)"
          strokeWidth="2"
          strokeDasharray="8 16"
        />
        <path
          className="animate-hero-flow"
          d="M-60 380 C 300 500, 620 260, 900 380 S 1260 520, 1520 400"
          stroke="url(#hero-line2)"
          strokeWidth="2"
          strokeDasharray="6 18"
          style={{ animationDuration: "12s" }}
        />

        <circle className="animate-hero-pulse" cx="840" cy="200" r="5" fill="#d5c9e9" />
        <circle className="animate-hero-pulse" cx="900" cy="380" r="4" fill="#b8a3da" style={{ animationDelay: "1.5s" }} />
        <circle className="animate-hero-pulse" cx="320" cy="120" r="3.5" fill="#eae4f4" style={{ animationDelay: "0.8s" }} />
      </svg>

      {/* Fade the hero into the page below */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-zinc-50 dark:to-zinc-950" />
    </div>
  );
}
