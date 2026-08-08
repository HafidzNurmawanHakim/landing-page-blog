"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin } from "@/app/actions/admin";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full"
      onClick={() => void logoutAdmin()}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Keluar
    </Button>
  );
}
