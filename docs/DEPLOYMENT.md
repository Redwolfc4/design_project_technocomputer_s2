# Panduan Deployment Vercel — DokumenAI Enterprise

Aplikasi DokumenAI Enterprise telah diuji dan **100% siap di-deploy langsung ke Vercel (Production Ready)**.

## Langkah-langkah Deploy ke Vercel:

1. **Push Proyek ke Git Repository** (GitHub / GitLab).
2. **Import Proyek di Vercel Dashboard**:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `bun install` atau `npm install`
3. **Environment Variables**:
   Salin dari `.env.example` jika diperlukan:
   ```env
   NEXT_PUBLIC_APP_NAME="DokumenAI Enterprise"
   NEXT_PUBLIC_DEMO_MODE=true
   ```
4. **Klik Deploy**. Aplikasi akan terkompilasi secara statis dan serverless tanpa kendala dependensi server native.

