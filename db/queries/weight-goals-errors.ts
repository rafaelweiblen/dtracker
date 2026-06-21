function isMissingWeightGoalsTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("no such table: weight_goals");
}

export { isMissingWeightGoalsTableError };
