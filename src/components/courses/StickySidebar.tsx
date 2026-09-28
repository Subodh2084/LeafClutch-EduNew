"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const TOP = 96; // clears the sticky navbar (top-24)
const BOTTOM_GAP = 24;

/**
 * Sticky from lg up. When the content is taller than the viewport, it scrolls
 * until its bottom is in view and sticks there, so nothing is left unreachable.
 */
export function StickySidebar({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.style.top = `${Math.min(TOP, window.innerHeight - el.offsetHeight - BOTTOM_GAP)}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} className={cn("lg:sticky lg:top-24", className)}>
      {children}
    </div>
  );
}
