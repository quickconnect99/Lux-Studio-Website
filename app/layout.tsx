import type { Viewport } from "next";
import { Barlow_Condensed, Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
import "@/app/globals.css";
import { WebVitalsReporter } from "@/components/telemetry/web-vitals-reporter";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { DEFAULT_THEME, themeIds } from "@/lib/themes";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["300", "400", "500", "600", "700"]
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700"]
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

const themeInitScript = `(function(){try{var allowed=${JSON.stringify(themeIds)};var stored=localStorage.getItem("theme");var theme=allowed.indexOf(stored)!==-1?stored:${JSON.stringify(DEFAULT_THEME)};document.documentElement.setAttribute("data-theme",theme);}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(DEFAULT_THEME)});}})();`;

/** viewport-fit=cover prevents notch/safe-area clipping on iOS. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${bodoniModa.variable} ${mono.variable}`}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <body className="font-[family-name:var(--font-sans)] antialiased">
        {/* Anti-FOUC: runs synchronously before any content renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NEXT_PUBLIC_ENABLE_TELEMETRY === "true" ? (
          <WebVitalsReporter />
        ) : null}
      </body>
    </html>
  );
}
