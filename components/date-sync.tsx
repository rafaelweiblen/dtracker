"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function localDateISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DateSync({ serverDate }: { serverDate: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const localDate = localDateISO();
    if (serverDate !== localDate) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", localDate);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [serverDate, router, pathname, searchParams]);

  return null;
}
