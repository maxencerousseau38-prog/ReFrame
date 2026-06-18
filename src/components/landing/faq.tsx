"use client";

import { Plus } from "@phosphor-icons/react";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { useI18n } from "@/lib/i18n";

export function FAQ() {
  const { t } = useI18n();
  const faqs = t.faq.items;
  return (
    <section id="faq" className="px-6 py-32">
      <div className="mx-auto max-w-[820px]">
        <BlurReveal className="mb-12 text-center">
          <h2 className="font-semibold leading-[1.04] tracking-[-0.03em] text-white [font-size:clamp(2.25rem,5.5vw,3.5rem)]">
            {t.faq.title}
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
