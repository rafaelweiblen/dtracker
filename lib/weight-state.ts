export function applyWeightSave(
  state: Record<string, Record<string, number>>,
  month: string,
  date: string,
  weight: number
): Record<string, Record<string, number>> {
  return { ...state, [month]: { ...(state[month] ?? {}), [date]: weight } };
}

export function applyWeightDelete(
  state: Record<string, Record<string, number>>,
  month: string,
  date: string
): Record<string, Record<string, number>> {
  if (!state[month]) return state;
  const { [date]: _, ...rest } = state[month];
  return { ...state, [month]: rest };
}

export function isFutureDate(date: string, today: string): boolean {
  return date > today;
}
