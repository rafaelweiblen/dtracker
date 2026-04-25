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
  escape: { icon: <UtensilsCrossed size={14} />, text: "Escapadas" },
  exercise: { icon: <Dumbbell size={14} />, text: "Exercícios" },
};

export function EntrySection({ type, entries, onEdit, onDelete }: EntrySectionProps) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  );

  const { icon, text } = LABELS[type];

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        {icon}{text}
      </h2>
      {sorted.map((entry) => (
        <EntryCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </section>
  );
}
