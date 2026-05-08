"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

function localDateISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Alinha `?date=` à data local do cliente quando difere do servidor.
 * Evita `useSearchParams()` aqui — sem `<Suspense>` em volta pode bloquear
 * a árvore RSC (página em branco / loading infinito no App Router).
 */
export function DateSync({ serverDate }: { serverDate: string }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const localDate = localDateISO();
    if (serverDate !== localDate) {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      params.set("date", localDate);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [serverDate, router, pathname]);

  return null;
}
