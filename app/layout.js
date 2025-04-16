import "./globals.css";

export const metadata = {
  title: "Ses Ara",
  description: "Developed by SubmitterTech",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
