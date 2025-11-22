// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',     // ← Obligatorio para endpoints
  adapter: vercel(),    // ← Necesario en Vercel
  integrations: [
    react()
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
