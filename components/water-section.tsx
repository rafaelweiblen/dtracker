"use client";

import { Droplets } from "lucide-react";
import type { Entry } from "@/db/schema";
import { WaterCard } from "./water-card";

interface WaterSectionProps {
  entries: Entry[];
  onDelete?: (id: string) => void;
}

export function WaterSection({ entries, onDelete }: WaterSectionProps) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  return (
    <section className="flex flex-col gap-2.5" aria-labelledby="section-water">
      <h2
        id="section-water"
        className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-muted-foreground"
      >
        <Droplets size={14} className="text-sky-600 dark:text-sky-400" aria-hidden />
        Água
        <span className="font-normal text-muted-foreground/80">({entries.length})</span>
      </h2>
      <div className="flex flex-col gap-2">
        {sorted.map((entry) => (
          <WaterCard key={entry.id} entry={entry} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
