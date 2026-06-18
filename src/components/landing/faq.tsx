"use client";

import { Plus } from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";

// Honest answers to the real objections a buyer has before paying.
const faqs: { q: string; a: string }[] = [
  {
    q: "Will it work on my existing website?",
    a: "Paste your URL and ReFrame reads your live site's text, images, logo and colours, then rebuilds from them. If a site is behind heavy bot-protection or is fully JavaScript-rendered, we tell you honestly and start from the details we could read plus sensible defaults you can edit.",
  },
  {
    q: "Do I lose my content or my brand?",
    a: "No. The rebuild keeps your real content, logo, images and colours, and follows your existing structure. Nothing is invented. You can then change anything you like.",
  },
  {
    q: "Can I keep my own domain?",
    a: "Yes. On a paid plan you connect your own domain with automatic SSL, and you keep ownership. There's no lock-in: cancel anytime.",
  },
  {
    q: "What if I don't like the result?",
    a: "The rebuild and preview are free. You see the full result before paying, and you only pay when you choose to publish it live.",
  },
  {
    q: "Do I need a developer or to learn a builder?",
    a: "No code, no builder. You change copy, colours, add pages or sections, switch to dark mode and more just by chatting with the AI editor. Changes appear instantly.",
  },
  {
    q: "What about SEO?",
    a: "Rebuilt sites ship clean semantic HTML, proper metadata, social link previews, structured data and a per-site sitemap and robots.txt, so search engines can index them properly.",
  },
  {
    q: "Is my data safe?",
    a: "We only read pages that are already public on the web. We never ask for your passwords, CMS logins or hosting access.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-6 py-32">
      <div className="mx-auto max-w-[820px]">
        <BlurReveal className="mb-12 text-center">
          <h2 className="font-semibold leading-[1.04] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,3.5rem)]">
            Questions, answered honestly.
          </h2>
        </BlurReveal>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[17px] font-medium text-white marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus
                  weight="bold"
                  className="h-5 w-5 shrink-0 text-accent transition-transform duration-300 group-open:rotate-45"
                />
              </summary>
              <p className="max-w-[68ch] pb-6 text-[15px] leading-relaxed text-zinc-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
