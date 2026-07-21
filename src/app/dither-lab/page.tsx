import type { Metadata } from "next";
import { DitherLab } from "./DitherLab";

// dev-only tuning page — delete before launch
export const metadata: Metadata = {
  title: "Dither lab",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DitherLab />;
}
