"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  /** Para `aria-controls` no elemento que abre o painel (ex.: date picker). */
  panelId?: string;
}

export function BottomSheet({
  open,
  onClose,
  children,
  className,
  panelId,
}: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={(e) => {
        if (e.target === ref.current) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "fixed inset-0 m-0 h-full w-full max-h-none max-w-none bg-transparent p-0",
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        "open:flex open:items-end open:justify-center"
      )}
    >
      <div
        id={panelId}
        className={cn(
          "max-h-[85dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-2xl border-t border-border/60 bg-background px-4 pb-safe-or-4 pt-4 shadow-xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-primary/25" aria-hidden />
        {children}
      </div>
    </dialog>
  );
}
