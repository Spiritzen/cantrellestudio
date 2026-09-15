// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// Micro-sprint pré-déploiement GitHub Pages — remplace le domaine placeholder
// CS-S0 (.example, RFC 2606) par la cible réelle de déploiement GitHub Pages
// du dépôt https://github.com/Spiritzen/cantrellestudio. `site` = origine du
// Pages utilisateur ; `base` = sous-chemin du dépôt (obligatoire pour un
// Pages de projet, pas un Pages utilisateur/organisation). Aucun domaine
// personnalisé n'est inventé — voir rapport_predeploiement_github_pages_*.
export default defineConfig({
  site: 'https://spiritzen.github.io',
  base: '/cantrellestudio',
  integrations: [
    react(),
    sitemap({
      // CS-S2B : /design-lab/ est un outil interne (noindex, non lié depuis
      // la navigation publique) et ne doit jamais apparaître dans le sitemap.
      // CS-S12A : /mentions-legales/ et /politique-confidentialite/ passent
      // temporairement noindex,follow (contenu encore placeholder, prompt
      // §3/§7) — exclues du sitemap en cohérence tant qu'elles ne sont pas
      // réellement indexables ; restent des routes normales, toujours
      // liées depuis le Footer.
      filter: (page) =>
        !page.includes('/design-lab') &&
        !page.includes('/mentions-legales') &&
        !page.includes('/politique-confidentialite'),
    }),
  ],
});
