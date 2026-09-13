// Micro-sprint pré-déploiement GitHub Pages — abstraction UNIQUE pour les
// liens internes base-aware. Le site sera publié sous un sous-chemin
// (`base: '/cantrellestudio'` dans astro.config.mjs), donc tout lien interne
// commençant par `/` doit passer par `withBase()` avant d'être rendu dans un
// `href`/`src`, sinon il pointe accidentellement vers la racine du domaine
// (`https://spiritzen.github.io/...`) au lieu du sous-chemin publié
// (`https://spiritzen.github.io/cantrellestudio/...`).
//
// Ne remplace PAS les chemins déjà gérés par `astro:assets` (Image/Picture),
// qui sont déjà base-aware nativement.

/**
 * Préfixe un chemin interne (commençant par `/`) avec `import.meta.env.BASE_URL`.
 * - Les liens externes (http/https), `mailto:` et `tel:` sont retournés tels quels.
 * - GOTCHA vérifié par build réel : avec `base: '/cantrellestudio'` (sans
 *   slash final dans astro.config.mjs), `import.meta.env.BASE_URL` vaut
 *   exactement `/cantrellestudio` — SANS slash final — contrairement à
 *   l'hypothèse initiale ("toujours terminé par /"). Une simple
 *   concaténation `base + relative` produisait donc des liens cassés du
 *   type `/cantrellestudioapplications-metier-saas/` (constaté dans le
 *   HTML buildé). Corrigé en normalisant explicitement les deux côtés de
 *   la jonction, quel que soit l'état réel de `BASE_URL`.
 * - En dev local (`base` par défaut `/`), c'est un no-op strict.
 */
export function withBase(path: string): string {
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith("mailto:") || path.startsWith("tel:") || path.startsWith("#")) {
    return path;
  }
  const base = import.meta.env.BASE_URL;
  const baseNoTrailingSlash = base.endsWith("/") ? base.slice(0, -1) : base;
  const pathWithLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return `${baseNoTrailingSlash}${pathWithLeadingSlash}`;
}

/**
 * Inverse de `withBase()` — retire le préfixe `base` d'un pathname s'il est
 * présent, pour comparer un `Astro.url.pathname` (dont l'inclusion ou non du
 * `base` dépend du contexte de rendu) à des routes canoniques non préfixées
 * (ex. dans la logique `isActive` du Header). Sans effet si le préfixe est
 * absent — sûr à appeler inconditionnellement.
 */
export function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL;
  const baseNoTrailingSlash = base.endsWith("/") ? base.slice(0, -1) : base;
  if (baseNoTrailingSlash && pathname.startsWith(baseNoTrailingSlash)) {
    const stripped = pathname.slice(baseNoTrailingSlash.length);
    return stripped.startsWith("/") ? stripped : `/${stripped}`;
  }
  return pathname;
}
