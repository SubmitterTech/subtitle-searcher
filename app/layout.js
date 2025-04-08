// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
  title: "Ses Ara",
  description: "Developed by SubmitterTech",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`--font-geist-sans`}>
        {children}
      </body>
    </html>
  );
}
