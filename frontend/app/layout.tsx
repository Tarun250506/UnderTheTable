import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnderTheTable | India's Public Corruption Registry",
  description:
    "Document reported bribery experiences. Explore patterns across government departments and locations in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}