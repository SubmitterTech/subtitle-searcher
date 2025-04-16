import "./globals.css";


export const metadata = {
  title: "Ses Ara",
  description: "Developed by SubmitterTech",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["ses", "elçi", "altyazı", "ara"],

  authors: [
    {
      name: "SubmitterTech",
      url: "https://github.com/submittertech",
    },
  ],
  icons: [
    { rel: "apple-touch-icon", url: "logo.png" },
    { rel: "icon", url: "favicon.png" },
  ],
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'cyan' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="--font-geist-sans">
        {children}
      </body>
    </html>
  );
}
