import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Ticker } from "./Ticker";

export function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div className="relative flex min-h-screen bg-ink-950">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-radial-accent opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-grid-faint [background-size:44px_44px] opacity-[0.4]" />

      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <Ticker />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
