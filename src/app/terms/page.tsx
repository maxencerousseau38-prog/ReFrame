import type { Metadata } from "next";
import { LegalLayout, H2 } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — ReFrame",
  description: "The terms that govern your use of ReFrame.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 11, 2026">
      <p>
        These Terms of Service (the &quot;Terms&quot;) govern your access to and
        use of ReFrame (the &quot;Service&quot;). By using the Service you agree
        to these Terms. If you do not agree, do not use the Service.
      </p>

      <H2>1. What ReFrame does</H2>
      <p>
        ReFrame analyzes the public content of a website you submit and rebuilds
        it into a modernized version, which you can further edit with AI. ReFrame
        is a transformation tool; it does not provide hosting, legal, or business
        advice.
      </p>

      <H2>2. Your responsibilities</H2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          You may only submit a website you own or are authorized to modify. You
          are responsible for having the rights to any content, images, logos and
          trademarks involved.
        </li>
        <li>You must not use the Service to infringe intellectual property, scrape sites you do not control, or generate unlawful, deceptive, or harmful content.</li>
        <li>You are responsible for reviewing any output before publishing it.</li>
      </ul>

      <H2>3. Content and ownership</H2>
      <p>
        You retain ownership of the content you submit and of the sites you
        publish. You grant ReFrame a limited license to process that content
        solely to provide the Service (crawling, analysis, generation, editing).
        The Service software, design system, and brand remain the property of
        ReFrame.
      </p>

      <H2>4. AI-generated output</H2>
      <p>
        Generated sites and edits are produced with automated systems and may
        contain errors or omissions. Output is provided for your review; you are
        solely responsible for verifying accuracy, legality, and suitability
        before use or publication.
      </p>

      <H2>5. Plans and billing</H2>
      <p>
        Paid plans are billed in advance on a recurring basis and are
        non-refundable except where required by law. You may cancel at any time;
        cancellation takes effect at the end of the current billing period.
      </p>

      <H2>6. Availability and &quot;as is&quot;</H2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, express or implied. We do not warrant
        that the Service will be uninterrupted, error-free, or that output will
        meet your requirements.
      </p>

      <H2>7. Limitation of liability</H2>
      <p>
        To the maximum extent permitted by law, ReFrame will not be liable for
        any indirect, incidental, or consequential damages, or for lost profits
        or data, arising from your use of the Service. Our total liability is
        limited to the amount you paid in the twelve months preceding the claim.
      </p>

      <H2>8. Termination</H2>
      <p>
        We may suspend or terminate access for violation of these Terms. You may
        stop using the Service at any time.
      </p>

      <H2>9. Changes</H2>
      <p>
        We may update these Terms. Material changes will be announced through the
        Service. Continued use after changes take effect constitutes acceptance.
      </p>

      <H2>10. Contact</H2>
      <p>
        Questions about these Terms: <span className="text-zinc-300">legal@reframe.design</span>.
      </p>
    </LegalLayout>
  );
}
