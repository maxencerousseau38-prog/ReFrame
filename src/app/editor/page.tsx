"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PaperPlaneTilt, CircleNotch, ArrowLeft, MagicWand, RocketLaunch, Check, ArrowCounterClockwise, ArrowClockwise, Sun, Moon, CaretLeft, ChatText } from "@phosphor-icons/react";
import { DashboardShell } from "@/components/dashboard/shell";
import { SiteRenderer } from "@/components/blocks";
import { PreviewStage } from "@/components/workspace/preview-stage";
import { usePersistentState } from "@/lib/use-persistent-state";
import { Button } from "@/components/ui/button";
import {
  loadSchema,
  saveSchema,
  fetchProject,
  updateProject,
  projectIdFromUrl,
} from "@/lib/store";
import type { SiteSchema } from "@/lib/generation/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Change the hero title",
  "Rewrite the About page intro",
  "Add a section to the Services page",
  "Change the brand color to navy",
  "Shorten the homepage copy",
  "Make it more premium",
];

export default function EditorPage() {
  const router = useRouter();
  const [schema, setSchema] = React.useState<SiteSchema | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your AI editor. Tell me what to change on any page - try “Rewrite the About page intro” or “Make it more premium”. Use the site's own nav in the preview to view each page; I update it instantly.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [published, setPublished] = React.useState<string | null>(null);
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [past, setPast] = React.useState<SiteSchema[]>([]); // undo history
  const [future, setFuture] = React.useState<SiteSchema[]>([]); // redo stack
  const scrollRef = React.useRef<HTMLDivElement>(null);
  // UX3 — Design Studio: the AI chat is a collapsible + resizable panel. Hidden,
  // it reserves NO space (not rendered) → the preview reclaims 100% of the row.
  const [chatOpen, setChatOpen] = usePersistentState("rf-editor-chat-open", true);
  const [chatWidth, setChatWidth] = usePersistentState("rf-editor-chat-w", 380);

  function startResize(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = chatWidth;
    const onMove = (ev: PointerEvent) => {
      setChatWidth(Math.min(560, Math.max(300, startW + (ev.clientX - startX))));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  function applyTo(s: SiteSchema) {
    setSchema(s);
    saveSchema(s);
    if (projectId) void updateProject(projectId, s);
  }

  function commit(nextSchema: SiteSchema, prevSchema: SiteSchema) {
    setPast((p) => [...p.slice(-19), prevSchema]); // remember the pre-edit state
    setFuture([]); // a fresh edit starts a new branch
    applyTo(nextSchema);
  }

  // Flip the brand-derived light/dark scheme. Undoable + persisted like any edit;
  // the surfaces re-derive from the brand colour, so the toggle stays on-brand.
  function toggleDark() {
    if (!schema || busy) return;
    const next = { ...schema, theme: { ...schema.theme, dark: !schema.theme.dark } };
    commit(next, schema);
  }

  function undo() {
    if (!past.length || busy || !schema) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [schema, ...f]);
    applyTo(prev);
    setMessages((m) => [...m, { role: "assistant", content: "Reverted the last change." }]);
  }

  function redo() {
    if (!future.length || busy || !schema) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p.slice(-19), schema]);
    applyTo(next);
    setMessages((m) => [...m, { role: "assistant", content: "Reapplied that change." }]);
  }

  React.useEffect(() => {
    // Loading a public share (from /r/<id> "Edit with AI"): fetch its schema so
    // an anonymous visitor can pick up exactly where their redesign left off.
    const shareId = new URLSearchParams(window.location.search).get("share");
    if (shareId) {
      fetch(`/api/share?id=${encodeURIComponent(shareId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.schema) {
            setSchema(d.schema);
            saveSchema(d.schema);
          } else {
            const s = loadSchema();
            if (!s) router.replace("/dashboard");
            else setSchema(s);
          }
        })
        .catch(() => {
          const s = loadSchema();
          if (s) setSchema(s);
          else router.replace("/dashboard");
        });
      return;
    }
    const pid = projectIdFromUrl();
    if (pid) {
      setProjectId(pid);
      fetchProject(pid).then((r) => {
        if (r) {
          setSchema(r.schema);
          saveSchema(r.schema);
          return;
        }
        const s = loadSchema();
        if (!s) router.replace("/dashboard");
        else setSchema(s);
      });
      return;
    }
    const s = loadSchema();
    if (!s) {
      router.replace("/dashboard");
      return;
    }
    setSchema(s);
  }, [router]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function setLastAssistant(content: string) {
    setMessages((m) => {
      const c = [...m];
      for (let i = c.length - 1; i >= 0; i--) {
        if (c[i].role === "assistant") {
          c[i] = { role: "assistant", content };
          return c;
        }
      }
      return [...m, { role: "assistant", content }];
    });
  }

  async function send(instruction: string) {
    if (!schema || !instruction.trim() || busy) return;
    const prev = schema;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: instruction }, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai-edit/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema: prev, instruction }),
      });
      if (!res.ok || !res.body) throw new Error("stream unavailable");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let streamed = "";
      let final: { schema?: SiteSchema; message?: string; changed?: boolean; error?: string } | null = null;

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const lineStr = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!lineStr) continue;
          const obj = JSON.parse(lineStr) as { t?: string; done?: boolean; schema?: SiteSchema; message?: string; changed?: boolean; error?: string };
          if (typeof obj.t === "string") {
            streamed += obj.t;
            setLastAssistant(streamed);
          }
          if (obj.done) final = obj;
        }
      }

      if (final?.schema && final.changed !== false) commit(final.schema, prev);
      else if (final?.schema) setSchema(final.schema);
      setLastAssistant(final?.message || streamed || final?.error || "Done.");
    } catch {
      // Fall back to the non-streaming endpoint so an edit never just fails.
      try {
        const res = await fetch("/api/ai-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schema: prev, instruction }),
        });
        const data = await res.json();
        if (data.schema && data.changed !== false) commit(data.schema, prev);
        else if (data.schema) setSchema(data.schema);
        setLastAssistant(data.message || "Done.");
      } catch {
        setLastAssistant("Something went wrong applying that edit.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!schema) return;
    try {
      const res = await fetch("/api/publish-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Hard paywall: publishing is paid — send free / over-limit users
        // straight to the plans page instead of explaining the limit in chat.
        if (data.code === "plan_required" || data.code === "plan_limit") {
          router.push("/#pricing");
          return;
        }
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error || "Could not publish. Please try again." },
        ]);
        return;
      }
      setPublished(data.url);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Could not publish. Please try again." }]);
    }
  }

  if (!schema) {
    return (
      <DashboardShell>
        <div className="flex h-screen items-center justify-center">
          <CircleNotch weight="bold" className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex h-screen flex-col lg:flex-row">
        {/* AI chat — collapsible + resizable panel */}
        {chatOpen && (
        <div
          className="relative flex w-full shrink-0 flex-col border-r border-border bg-background lg:w-[var(--chat-w)]"
          style={{ "--chat-w": `${chatWidth}px` } as React.CSSProperties}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <MagicWand weight="bold" className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">AI Editor</div>
                <div className="truncate text-xs text-muted-foreground">{schema.brand.name}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!past.length || busy}
                title="Undo last change"
                aria-label="Undo last change"
              >
                <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!future.length || busy}
                title="Redo"
                aria-label="Redo"
              >
                <ArrowClockwise weight="bold" className="h-4 w-4" />
              </Button>
              <Link href="/result">
                <Button variant="ghost" size="sm" title="Back to result"><ArrowLeft weight="bold" className="h-4 w-4" /></Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChatOpen(false)}
                title="Hide panel — focus the preview"
                aria-label="Hide panel"
              >
                <CaretLeft weight="bold" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-sm text-accent-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-sm"
                  }
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CircleNotch weight="bold" className="h-3.5 w-3.5 animate-spin" /> Applying
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
            {SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe a change…"
              disabled={busy}
              className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground/20 focus:ring-4 focus:ring-foreground/5"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} className="h-11 w-11">
              <PaperPlaneTilt weight="bold" className="h-4 w-4" />
            </Button>
          </form>

          {/* Drag to resize (desktop) */}
          <div
            onPointerDown={startResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panel"
            className="absolute right-0 top-0 hidden h-full w-1.5 translate-x-1/2 cursor-col-resize bg-transparent transition-colors hover:bg-accent/40 lg:block"
          />
        </div>
        )}

        {/* Live preview (UX2 PreviewStage). relative → floating reopen cluster
            when the chat is hidden, so no control is ever lost. */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-secondary/30">
          {!chatOpen && (
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-0.5 rounded-full border border-border bg-background/80 p-1 shadow-lg shadow-black/30 backdrop-blur-xl">
              <button
                onClick={() => setChatOpen(true)}
                title="Open AI editor"
                aria-label="Open AI editor"
                className="flex h-8 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-medium text-accent-foreground transition-transform hover:brightness-105 active:scale-95"
              >
                <ChatText weight="bold" className="h-4 w-4" /> AI
              </button>
              <button onClick={undo} disabled={!past.length || busy} title="Undo" aria-label="Undo" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground disabled:opacity-40">
                <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
              </button>
              <button onClick={redo} disabled={!future.length || busy} title="Redo" aria-label="Redo" className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground disabled:opacity-40">
                <ArrowClockwise weight="bold" className="h-4 w-4" />
              </button>
            </div>
          )}
          <PreviewStage
            label={schema.brand.name}
            actions={
              <>
                <button
                  onClick={toggleDark}
                  disabled={busy}
                  aria-label={schema.theme.dark ? "Switch to light mode" : "Switch to dark mode"}
                  title={schema.theme.dark ? "Light mode" : "Dark mode"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-50"
                >
                  {schema.theme.dark ? <Sun weight="bold" className="h-4 w-4" /> : <Moon weight="bold" className="h-4 w-4" />}
                </button>
                {published ? (
                  <a href={published} target="_blank" rel="noreferrer">
                    <Button size="sm"><Check weight="bold" className="h-4 w-4" /> Live</Button>
                  </a>
                ) : (
                  <Button size="sm" onClick={publish}><RocketLaunch weight="bold" className="h-4 w-4" /> Publish</Button>
                )}
              </>
            }
          >
            <SiteRenderer schema={schema} />
          </PreviewStage>
        </div>
      </div>
    </DashboardShell>
  );
}
