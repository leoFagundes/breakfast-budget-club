import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AlertProvider } from "./context/alertContext";
import Alert from "@/components/alert";
import AccountContainer from "@/components/accountContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutritionClub",
  description: "Breakfast Budget Club",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AccountContainer />
        <AlertProvider>
          {children}
          <Alert />
        </AlertProvider>

        <footer className="w-full flex justify-center p-6 flex-1 items-end">
          <span className="text-center text-gray-800">
            O Clube de Café da Manhã Econômico é um método de operação diária
            bem-sucedido para um grupo de distribuidores e é compartilhado aqui
            para sua inspiração. Cada distribuidor pode escolher como
            administrar suas operações do Clube de Nutrição, sujeito à
            conformidade com as regras da Herbalife e as leis aplicáveis.
          </span>
        </footer>
      </body>
    </html>
  );
}
