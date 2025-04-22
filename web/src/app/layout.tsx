import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  display: "swap",
  fallback: ['Arial', 'sans-serif'],
  preload: false,
});

export const metadata: Metadata = {
  title: "Fazenda Brilhante - Defesa Administrativa | Vale Verde",
  description: "Defesa administrativa da Fazenda Brilhante contra a notificação da FUNAI para estudos demarcatórios da Terra Indígena Dourados-Amambaipeguá II",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${roboto.className} min-h-screen bg-[var(--background-light)]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
