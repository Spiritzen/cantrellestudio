// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// Production Cantrelle Studio
// Domaine principal hébergé chez LWS.
// Le site est publié à la racine du domaine : aucun `base` n'est nécessaire.
export default defineConfig({
  site: 'https://cantrelle-studio.com',

  integrations: [
    react(),

    sitemap({
      // /design-lab/ reste un outil interne.
      // /politique-confidentialite/ reste exclue du sitemap selon le choix SEO actuel.
      filter: (page) =>
        !page.includes('/design-lab') &&
        !page.includes('/politique-confidentialite'),
    }),
  ],
});