"use client";

import { usePathname, useRouter } from "next/navigation";
import { PrototypeSwitcher } from "./prototype-switcher";

// Three variants of the calendar stats strip, switchable via `?variant=`, on `/calendar`.

type StripDemo = "ok" | "empty" | "zero";

function demoCopy(strip: StripDemo) {
  if (strip === "empty") {
    return {
      smaValue: "Sem dados",
      smaLabel: "Média 7 dias",
      smaFull: "Sem dados - Média 7 dias",
      exValue: "Sem dados",
      exLabel: null as string | null,
      exFull: "Sem dados",
    };
  }
  if (strip === "zero") {
    return {
      smaValue: "73,2 kg",
      smaLabel: "Média 7 dias",
      smaFull: "73,2 kg - Média 7 dias",
      exValue: "0 treinos",
      exLabel: "12 Meses",
      exFull: "0 treinos - 12 Meses",
    };
  }
  return {
    smaValue: "73,2 kg",
    smaLabel: "Média 7 dias",
    smaFull: "73,2 kg - Média 7 dias",
    exValue: "3 treinos",
    exLabel: "6 Meses",
    exFull: "3 treinos - 6 Meses",
  };
}

function VariantA({ strip }: { strip: StripDemo }) {
  const c = demoCopy(strip);
  return (
    <div className="grid grid-cols-2 gap-x-4 pt-1">
      <div className="min-w-0 text-center">
        <p className="text-metric tabular-nums leading-none">{c.smaValue}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{c.smaLabel}</p>
      </div>
      <div className="min-w-0 text-center">
        <p className="text-metric tabular-nums leading-none">{c.exValue}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{c.exLabel ?? "\u00a0"}</p>
      </div>
    </div>
  );
}

function VariantB({ strip }: { strip: StripDemo }) {
  const c = demoCopy(strip);
  return (
    <p className="pt-1 text-left text-[13px] leading-snug text-muted-foreground">
      {c.smaFull}
      {c.exFull !== c.smaFull ? (
        <>
          <span className="mx-1.5 text-border">|</span>
          {c.exFull}
        </>
      ) : null}
    </p>
  );
}

function VariantC({ strip }: { strip: StripDemo }) {
  const c = demoCopy(strip);
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div>
        <p className="font-heading text-3xl font-medium tracking-tight">
          {c.smaValue}
        </p>
        <p className="mt-0.5 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {c.smaLabel}
        </p>
      </div>
      <div>
        <p className="font-heading text-3xl font-medium tracking-tight">
          {c.exValue}
        </p>
        {c.exLabel ? (
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {c.exLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const STRIPS: StripDemo[] = ["ok", "empty", "zero"];
const STRIP_LABEL: Record<StripDemo, string> = {
  ok: "com dados",
  empty: "sem janela",
  zero: "zero na janela",
};

export function CalendarStatsStripPrototype({
  variant,
  strip,
}: {
  variant: string;
  strip: StripDemo;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function setStrip(next: StripDemo) {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    params.set("strip", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <>
      {variant === "B" ? (
        <VariantB strip={strip} />
      ) : variant === "C" ? (
        <VariantC strip={strip} />
      ) : (
        <VariantA strip={strip} />
      )}

      <p className="sr-only">
        PROTOTYPE variant={variant} strip={strip} sma={demoCopy(strip).smaFull}{" "}
        exercicio={demoCopy(strip).exFull}
      </p>
      <p
        aria-hidden
        className="mt-3 font-mono text-[10px] text-muted-foreground/80"
      >
        PROTOTYPE {variant} · {STRIP_LABEL[strip]}
      </p>

      <div className="pointer-events-none fixed inset-x-0 bottom-[6.75rem] z-[60] flex justify-center px-3">
        <div className="pointer-events-auto flex gap-1 rounded-full bg-muted px-1 py-1 text-[11px] shadow">
          {STRIPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStrip(s)}
              className={
                s === strip
                  ? "rounded-full bg-foreground px-2.5 py-1 font-medium text-background"
                  : "rounded-full px-2.5 py-1 text-muted-foreground"
              }
            >
              {STRIP_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <PrototypeSwitcher
        variants={["A", "B", "C"]}
        current={variant}
        names={{ A: "Colunas", B: "Legenda", C: "Placar" }}
      />
    </>
  );
}
