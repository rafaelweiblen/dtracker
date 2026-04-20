"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="gap-2"
    >
      <LogOut size={16} aria-hidden />
      Sair
    </Button>
  );
}
