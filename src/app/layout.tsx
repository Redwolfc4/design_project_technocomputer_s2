import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DokumenAI Enterprise — Intelligent Document Processing (IDP)',
  description:
    'Platform AI Document Intelligence Kelas Enterprise untuk otomasi ekstraksi Faktur Pajak e-Faktur, Invoice Komersial, PO, dan Dokumen Finansial Indonesia dengan verifikasi Human-in-the-Loop.',
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
