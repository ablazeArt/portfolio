import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Fuart Madnurak",
  description:
    "A readable, auto-scrolling overview of Fuart Madnurak's project work.",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
