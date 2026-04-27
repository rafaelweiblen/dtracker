"use client";

import { useState } from "react";
import { WeightCard } from "./weight-card";
import { DailyLog } from "./daily-log";
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

  return (
    <>
      <WeightCard weight={todayWeight} previousWeight={previousWeight} />
      <DailyLog
        initialEntries={initialEntries}
        date={date}
        onWeightSaved={setTodayWeight}
      />
    </>
  );
}
