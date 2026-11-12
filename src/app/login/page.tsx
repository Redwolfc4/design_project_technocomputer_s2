import React from 'react';
import { AnimatedAuthLayout } from '@/components/auth/AnimatedAuthLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — DokumenAI Enterprise',
  description: 'Masuk ke akun enterprise DokumenAI untuk pemrosesan faktur dan dokumen cerdas',
};

export default function LoginPage() {
  return <AnimatedAuthLayout initialMode="login" variant="account" />;
}
