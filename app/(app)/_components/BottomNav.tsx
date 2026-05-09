"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/calendar", label: "Calendário", icon: Calendar },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="safe-area-bottom z-50 border-t border-border/80 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="flex min-h-16 items-stretch justify-around px-1 pt-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.35 : 1.85}
                  aria-hidden
                  className="shrink-0"
                />
                <span className="truncate">{label}</span>
                <span
                  className={cn(
                    "h-1 w-1 shrink-0 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-transparent"
                  )}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
