import React from 'react';
import { AnimatedAuthLayout } from '@/components/auth/AnimatedAuthLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Demo Enterprise — DokumenAI',
  description: 'Pilih peran simulasi enterprise untuk menguji alur kerja DokumenAI',
};

export default function DemoLoginPage() {
  return <AnimatedAuthLayout initialMode="login" variant="demo" />;
}

