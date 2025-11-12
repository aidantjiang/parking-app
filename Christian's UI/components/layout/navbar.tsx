"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/providers/auth-provider";
import { cn } from "@/utils/cn";

const links = [
  { href: "/events", label: "Events" },
  { href: "/events/create", label: "Create Event", role: "admin" as const },
  { href: "/settings", label: "Settings", role: "admin" as const },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthContext();

  return (
    <header className="sticky top-0 z-40 border-b border-onyx-500/10 bg-buff-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/events" className="flex items-center gap-3">
          <div className="rounded-2xl bg-onyx-700 px-3 py-1 text-buff-100 font-bold">CU</div>
          <div>
            <p className="font-display text-sm leading-tight text-onyx-600">Parking Ops</p>
            <p className="text-xs uppercase tracking-widest text-onyx-400">Vision Node Network</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links
            .filter((link) => !link.role || user?.role === link.role)
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold transition",
                  pathname?.startsWith(link.href)
                    ? "bg-onyx-700 text-white"
                    : "text-onyx-500 hover:bg-onyx-500/10"
                )}
              >
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && <span className="hidden text-sm text-onyx-500 md:inline">{user.displayName ?? "Attendant"}</span>}
          {user ? (
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="primary">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
