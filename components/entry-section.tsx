"use client";

import { UtensilsCrossed, Dumbbell } from "lucide-react";
import type { Entry, EntryType } from "@/db/schema";
import { EntryCard } from "./entry-card";

interface EntrySectionProps {
  type: EntryType;
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

const LABELS: Record<EntryType, { icon: React.ReactNode; text: string }> = {
  escape: {
    icon: <UtensilsCrossed size={14} className="text-destructive" aria-hidden />,
    text: "Escapadas",
  },
  exercise: {
    icon: <Dumbbell size={14} className="text-primary" aria-hidden />,
    text: "Exercícios",
  },
};

const EMPTY_COPY: Record<EntryType, string> = {
  escape: "Nenhuma escapada registada neste dia.",
  exercise: "Nenhum exercício registado neste dia.",
};

export function EntrySection({ type, entries, onEdit, onDelete }: EntrySectionProps) {
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  const { icon, text } = LABELS[type];

  return (
    <section className="flex flex-col gap-2.5" aria-labelledby={`section-${type}`}>
      <h2
        id={`section-${type}`}
        className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight text-muted-foreground"
      >
        {icon}
        {text}
      </h2>
      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 bg-muted/40 px-4 py-5 text-center text-sm leading-relaxed text-muted-foreground">
          {EMPTY_COPY[type]}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
