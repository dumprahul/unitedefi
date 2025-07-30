import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sfProDisplayLight = localFont({
  src: "../../public/SF-Pro-Display-Light.otf",
  variable: "--font-sf-pro-light",
});

const sfProDisplayRegular = localFont({
  src: "../../public/SF-Pro-Display-Regular.otf",
  variable: "--font-sf-pro-regular",
});

const sfProDisplayBold = localFont({
  src: "../../public/SF-Pro-Display-Bold.otf",
  variable: "--font-sf-pro-bold",
});

export const metadata: Metadata = {
  title: "EmojiPay - Cross-Chain Payments with Emojis",
  description: "Revolutionary cross-chain payment platform where you can pay with emojis. Connect your wallet and start transacting across multiple blockchains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sfProDisplayLight.variable} ${sfProDisplayRegular.variable} ${sfProDisplayBold.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
