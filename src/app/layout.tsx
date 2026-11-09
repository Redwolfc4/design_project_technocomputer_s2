import type { Metadata } from 'next';
import './compiled.css';

export const metadata: Metadata = {
  title: 'DokumenAI Enterprise — Intelligent Document Processing (IDP)',
  description:
    'Platform AI Document Intelligence Kelas Enterprise untuk otomasi ekstraksi Faktur Pajak e-Faktur, Invoice Komersial, PO, dan Dokumen Finansial Indonesia dengan verifikasi Human-in-the-Loop.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-[#FAFAFF] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
