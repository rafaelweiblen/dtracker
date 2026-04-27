"use client";

import { useState, useEffect } from "react";
import { WeightCard } from "./weight-card";
import { DailyLog } from "./daily-log";
import { EditWeightBottomSheet } from "./edit-weight-bottom-sheet";
import type { Entry } from "@/db/schema";

interface HomeClientWrapperProps {
  initialTodayWeight: number | null;
  previousWeight: number | null;
  initialEntries: Entry[];
  date: string;
}

export function HomeClientWrapper({
  initialTodayWeight,
  previousWeight,
  initialEntries,
  date,
}: HomeClientWrapperProps) {
  const [todayWeight, setTodayWeight] = useState(initialTodayWeight);
  const [editingWeight, setEditingWeight] = useState(false);

  useEffect(() => {
    const month = date.slice(0, 7);
    fetch(`/api/weight/${month}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, number> | null) => {
        if (data) setTodayWeight(data[date] ?? null);
      })
      .catch(() => {});
  }, [date]);

  return (
    <>
      <WeightCard
        weight={todayWeight}
        previousWeight={previousWeight}
        onEdit={() => setEditingWeight(true)}
      />
      <DailyLog
        initialEntries={initialEntries}
        date={date}
        currentWeight={todayWeight}
        onWeightSaved={setTodayWeight}
      />
      <EditWeightBottomSheet
        open={editingWeight}
        onClose={() => setEditingWeight(false)}
        date={date}
        initialWeight={todayWeight}
        onSuccess={(weight) => setTodayWeight(weight)}
        onDelete={() => setTodayWeight(null)}
      />
    </>
  );
}
