"use client";

import Link from "next/link";
import { LogOut, Settings, LayoutDashboard, Sun, Moon, ShieldCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { getInitials } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  nom?: string | null;
  email?: string | null;
  isAdmin?: boolean;
}

export function UserMenu({ nom, email, isAdmin }: UserMenuProps) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-3 px-2 py-2 text-left"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-chart-2 text-xs font-semibold text-white">
            {getInitials(nom)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{nom ?? "Mon compte"}</span>
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="size-4" /> Tableau de bord
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/parametres">
            <Settings className="size-4" /> Paramètres
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck className="size-4" /> Espace admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          Thème {resolvedTheme === "dark" ? "clair" : "sombre"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} variant="destructive">
          <LogOut className="size-4" /> Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
