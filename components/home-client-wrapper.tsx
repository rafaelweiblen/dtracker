"use client";

import { useState } from "react";
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
  const isToday = date === new Date().toISOString().slice(0, 10);

  return (
    <>
      <WeightCard
        weight={todayWeight}
        previousWeight={previousWeight}
        onEdit={() => setEditingWeight(true)}
        isToday={isToday}
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
        onSuccess={(weight, savedDate) => {
          if (savedDate === date) setTodayWeight(weight);
        }}
        onDelete={() => setTodayWeight(null)}
      />
    </>
  );
}
