import type { Metadata } from "next";
import { LegalLayout, H2 } from "@/components/legal/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — ReFrame",
  description: "How ReFrame collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 11, 2026">
      <p>
        This Privacy Policy explains what data ReFrame collects, how we use it,
        and the choices you have. We aim to collect only what is needed to run
        the Service.
      </p>

      <H2>1. Data we collect</H2>
      <ul className="list-disc space-y-2 pl-5">
        <li><span className="text-zinc-300">Site data you submit:</span> the URL you provide and the public content fetched from it (text, images, logo, colors, structure) used to analyze and rebuild your site.</li>
        <li><span className="text-zinc-300">Account data:</span> name and email when you create an account.</li>
        <li><span className="text-zinc-300">Usage data:</span> basic logs and analytics to operate and improve the Service.</li>
      </ul>

      <H2>2. How we use it</H2>
      <p>
        To analyze and transform your site, power the AI editor, maintain your
        account, prevent abuse, and improve the product. We do not sell your
        personal data.
      </p>

      <H2>3. Service providers</H2>
      <p>
        We rely on third parties to operate the Service, including an AI model
        provider (Anthropic) to generate and edit content, plus hosting and
        analytics providers. These providers process data on our behalf under
        their respective terms.
      </p>

      <H2>4. Crawled content</H2>
      <p>
        When you submit a URL, we fetch its publicly accessible pages. We do not
        attempt to access private or authenticated areas, and we honor standard
        request limits. You are responsible for having the right to transform the
        site you submit.
      </p>

      <H2>5. Cookies</H2>
      <p>
        We use essential cookies for authentication and session management, and
        limited analytics cookies to understand usage. You can control cookies
        through your browser settings.
      </p>

      <H2>6. Data retention</H2>
      <p>
        We retain project and account data while your account is active. You can
        delete projects or your account at any time, after which associated data
        is removed within a reasonable period, except where retention is required
        by law.
      </p>

      <H2>7. Your rights</H2>
      <p>
        Depending on your location (including the EU/EEA under GDPR and California
        under CCPA), you may have rights to access, correct, export, or delete
        your personal data, and to object to certain processing. To exercise
        these rights, contact us.
      </p>

      <H2>8. Security</H2>
      <p>
        We use reasonable technical and organizational measures to protect your
        data. No method of transmission or storage is completely secure, and we
        cannot guarantee absolute security.
      </p>

      <H2>9. International transfers</H2>
      <p>
        Your data may be processed in countries other than your own. Where
        required, we use appropriate safeguards for such transfers.
      </p>

      <H2>10. Contact</H2>
      <p>
        Privacy questions or requests: <span className="text-zinc-300">privacy@reframe.design</span>.
      </p>
    </LegalLayout>
  );
}
