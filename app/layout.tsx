import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});
import localFont from "next/font/local";
const yaroCutFont = localFont({
  src: [
    {
      path: "./fonts/yaro/yarocut-thin-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/yaro/yarocut-black-webfont.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-yaroCut",
});
const yaroOpFont = localFont({
  src: [
    {
      path: "./fonts/yaro/yaroop-thin-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/yaro/yaroop-webfont.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-yaroOp",
});

import { ThemeProvider } from "@/components/client/theme-provider";
import Footer from "@/components/footer";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`font-sans  ${yaroOpFont.variable} ${yaroCutFont.variable} ${montserrat.variable} `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Footer />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
