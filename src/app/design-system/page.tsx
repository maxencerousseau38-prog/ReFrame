import type { Metadata } from "next";
import { DesignSystemGallery } from "./gallery";

export const metadata: Metadata = {
  title: "Design System — ReFrame",
  description: "The official ReFrame component library, rendered on the frozen tokens.",
};

export default function DesignSystemPage() {
  return <DesignSystemGallery />;
}
