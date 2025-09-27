import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MagenTest - Gerador de Casos de Teste com IA',
  description: 'Gerador inteligente de casos de teste usando IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" style={{ colorScheme: 'dark' }}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}