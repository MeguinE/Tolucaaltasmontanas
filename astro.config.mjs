// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import dotenv from 'dotenv';

export default defineConfig({
  integrations: [
    react()    // ← ACTIVA REACT EN ASTRO
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
