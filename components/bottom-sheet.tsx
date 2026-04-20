"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  children,
  className,
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
      onClose={onClose}
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
        className={cn(
          "w-full max-w-lg rounded-t-2xl bg-background px-4 pb-safe-or-4 pt-4 shadow-xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
        {children}
      </div>
    </dialog>
  );
}
