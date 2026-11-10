import React from 'react';
import { AnimatedAuthLayout } from '@/components/auth/AnimatedAuthLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account — DokumenAI Enterprise',
  description: 'Daftar akun enterprise DokumenAI untuk pemrosesan faktur dan dokumen cerdas',
};

export default function RegisterPage() {
  return <AnimatedAuthLayout initialMode="register" variant="account" />;
}

