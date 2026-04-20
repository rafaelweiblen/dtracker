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
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background safe-area-bottom">
      <ul className="flex h-16 items-center justify-around">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.75}
                  aria-hidden
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
