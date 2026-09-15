"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PrototypeSwitcher({
  variants,
  current,
  names,
}: {
  variants: string[];
  current: string;
  names?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function go(next: string) {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    params.set("variant", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function cycle(delta: number) {
    const i = variants.indexOf(current);
    const next = variants[(i + delta + variants.length) % variants.length];
    if (next) go(next);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        cycle(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        cycle(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, pathname, router, variants]);

  const label = names?.[current] ? `${current} (${names[current]})` : current;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-3">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-foreground px-2 py-1.5 text-background shadow-lg">
        <button
          type="button"
          onClick={() => cycle(-1)}
          aria-label="Variante anterior"
          className="rounded-full p-1.5 hover:bg-background/20"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <span className="min-w-36 px-1 text-center text-xs font-semibold tabular-nums">
          {label}
        </span>
        <button
          type="button"
          onClick={() => cycle(1)}
          aria-label="Variante seguinte"
          className="rounded-full p-1.5 hover:bg-background/20"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
