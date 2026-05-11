import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const body = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fuart | Orbital Portfolio",
  description:
    "An interactive portfolio where each project is represented as a planet in orbit.",
  openGraph: {
    images: ["/portfolio-system.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/portfolio-system.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
