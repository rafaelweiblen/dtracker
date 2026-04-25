"use client";

import { useState, useTransition } from "react";
import { fixEntryDates } from "@/app/actions/entries";

export function FixDatesButton() {
  const [msg, setMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleFix() {
    startTransition(async () => {
      const offset = new Date().getTimezoneOffset();
      const count = await fixEntryDates(offset);
      setMsg(
        count > 0
          ? `${count} registro(s) corrigido(s).`
          : "Nenhuma correção necessária."
      );
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleFix}
        disabled={isPending}
        className="rounded-xl border px-4 py-3 text-left text-sm font-medium text-muted-foreground disabled:opacity-50"
      >
        {isPending ? "Corrigindo…" : "Corrigir datas de registros"}
      </button>
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
