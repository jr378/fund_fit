import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrgProvider } from "@/components/OrgProvider";
import { Nav } from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FundFit — funding cockpit for nonprofits",
  description:
    "FundFit helps nonprofits find funders worth pursuing and get application-ready faster. Demo using sample data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#f6f8fa] text-slate-900">
        <OrgProvider>
          <Nav />
          <main className="print-full mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="no-print border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400">
              FundFit · Demo / MVP · All funders and figures are sample data. Not legal, tax,
              accounting, or guaranteed grant advice.
            </div>
          </footer>
        </OrgProvider>
      </body>
    </html>
  );
}
