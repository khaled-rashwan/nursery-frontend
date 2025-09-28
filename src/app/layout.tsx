
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Future Step Kindergarten",
  description: "Future Step International Kindergarten - Building Tomorrow's Leaders",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
