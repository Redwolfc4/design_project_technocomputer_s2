import React from 'react';
import { AnimatedAuthLayout } from '@/components/auth/AnimatedAuthLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Simulasi Demo — DokumenAI Enterprise',
  description: 'Daftarkan peran simulasi kustom untuk menguji alur kerja DokumenAI',
};

export default function DemoRegisterPage() {
  return <AnimatedAuthLayout initialMode="register" variant="demo" />;
}

