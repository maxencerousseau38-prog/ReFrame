"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneTilt, CircleNotch, ArrowLeft, MagicWand, RocketLaunch, Check } from "@phosphor-icons/react";
import { DashboardShell } from "@/components/dashboard/shell";
import { SiteRenderer } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import { loadSchema, saveSchema } from "@/lib/store";
import type { SiteSchema } from "@/lib/generation/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Change hero title to “Built for what’s next”",
  "Add an FAQ section",
  "Make it more premium",
  "Change the accent color to teal",
  "Add a testimonials section",
  "Improve conversion",
];

export default function EditorPage() {
  const router = useRouter();
  const [schema, setSchema] = React.useState<SiteSchema | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm your AI editor. Tell me what to change. Try “Add an FAQ section” or “Make it more premium” and I'll update the live preview instantly.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [published, setPublished] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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

  async function send(instruction: string) {
    if (!schema || !instruction.trim() || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: instruction }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema, instruction }),
      });
      const data = await res.json();
      await new Promise((r) => setTimeout(r, 500));
      if (data.schema) {
        setSchema(data.schema);
        saveSchema(data.schema);
      }
      setMessages((m) => [...m, { role: "assistant", content: data.message || "Done." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong applying that edit." }]);
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!schema) return;
    const res = await fetch("/api/publish-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema }),
    });
    const data = await res.json();
    setPublished(data.url);
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
        {/* Chat panel */}
        <div className="flex w-full flex-col border-r border-border bg-background lg:w-[400px]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <MagicWand weight="bold" className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">AI Editor</div>
                <div className="text-xs text-muted-foreground">{schema.brand.name}</div>
              </div>
            </div>
            <Link href="/result">
              <Button variant="ghost" size="sm"><ArrowLeft weight="bold" className="h-4 w-4" /></Button>
            </Link>
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
        </div>

        {/* Live preview */}
        <div className="flex flex-1 flex-col bg-secondary/30">
          <div className="flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur-xl">
            <span className="text-xs font-medium text-muted-foreground">Live preview</span>
            {published ? (
              <a href={published} target="_blank" rel="noreferrer">
                <Button size="sm"><Check weight="bold" className="h-4 w-4" /> Live</Button>
              </a>
            ) : (
              <Button size="sm" onClick={publish}><RocketLaunch weight="bold" className="h-4 w-4" /> Publish</Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-black/5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify(schema.blocks.map((b) => b.id + b.variant)) + schema.theme.accent}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <SiteRenderer schema={schema} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
