<div align="center">

# Cantrelle Studio

### Applications métier · SaaS · Sites professionnels
**Concevoir · Structurer · Développer · Faire évoluer**

</div>

---

> **Cantrelle Studio** est un studio de développement orienté **applications métier, SaaS, sites professionnels et solutions numériques sur mesure**.
>
> Le projet repose sur un principe simple :
>
> **la technologie s’adapte au projet, pas l’inverse.**

Le site est conçu comme une **vitrine commerciale destinée aux prospects et futurs clients**, et non comme un portfolio recruteur.

Pour le détail des décisions, du workflow et de l’état technique réel du projet, voir [`CONTEXT.md`](./CONTEXT.md).

---

## 🎯 Positionnement

Cantrelle Studio s’adresse principalement à :

- des PME ;
- des porteurs de projets ;
- des structures ayant un vrai besoin logiciel ;
- des TPE et indépendants ayant besoin d’un site professionnel performant.

Trois pôles structurent l’offre :

### Applications métier & SaaS

- CRM ;
- tableaux de bord ;
- workflows ;
- facturation ;
- portails ;
- API ;
- outils internes ;
- authentification et rôles ;
- SaaS multi-utilisateurs.

### Sites professionnels

- sites vitrines ;
- SEO technique ;
- responsive ;
- performance ;
- architecture de contenu ;
- intégration visuelle ;
- expériences web soignées.

### Développement sur mesure

- intégrations API ;
- automatisation ;
- fonctionnalités spécifiques ;
- modernisation ;
- évolution d’un produit existant ;
- refonte technique.

---

## ✅ Statut du projet — 12 septembre 2026

Phase actuelle :

**CS-S9B terminé — Pages services premium + médias + motion léger GREEN techniquement.**

Les 3 pages services affichent désormais de vraies captures d'écran
(Sereno, AgencyOS, Belkhir Dépannage déjà présents dans le projet, plus
Ink Red Plumes, MyDashServ, BeatStudio et Vélocéan récupérés depuis le
portfolio public et les démonstrations GitHub Pages) avec une grille de
preuves asymétrique, une nouvelle section "Mode de collaboration" et un
motion léger (reveal + replay) cohérent avec la Home, via un composant
séparé qui ne touche pas au motion system de la Home. Aucune nouvelle
dépendance, Hero 3D et Home non modifiés. Voir `CONTEXT.md` section
5.0quinquies. Prochaine étape : validation visuelle et commerciale
humaine.

**CS-S9 terminé — Pages services (3 landings SEO/commerciales) GREEN techniquement.**

Les 3 pages `/applications-metier-saas/`, `/sites-professionnels/` et
`/developpement-sur-mesure/` (jusque-là en contenu provisoire) sont
devenues de vraies landings : intention de recherche claire, preuves
honnêtes (Sereno, AgencyOS, Belkhir Dépannage réutilisés depuis les
réalisations ; MyDashServ, BeatStudio, GlassTrack, Vélocéan en preuves
textuelles sourcées), composition visuelle distincte par page, SEO
on-page complet (title/meta/canonical uniques, 1 H1, maillage interne).
Zéro JS ajouté, zéro nouvelle dépendance, rendu 100% statique Astro.
Voir `CONTEXT.md` section 5.0quater. Prochaine étape : validation
visuelle et commerciale humaine.

**CS-S8B terminé — Surfaces & composants premium GREEN techniquement.**

La Home gagne en matière et en hiérarchie visuelle sur ses 6 sections
restantes (Expertises en plaques éditoriales, Approche en architecture
avec profondeur, Réalisations affinée sans changer layout/médias,
Méthode en rail horizontal/timeline verticale, Capacités en board
technique avec séparateurs, CTA final en panneau de conclusion premium)
— aucune nouvelle copy, aucune nouvelle dépendance, 3D et motion system
strictement préservés. Voir `CONTEXT.md` section 5.0ter. Prochaine
étape : validation visuelle humaine (Sébastien).

**CS-S8A terminé — Fix dev + replay reveals + restauration médias GREEN techniquement.**

Corrige 3 problèmes signalés sur CS-S8 : `npm run dev` (PARSE_ERROR causé
par une balise `<script>` littérale dans un commentaire, piégeant le
scanner de dépendances Vite), le cadrage des captures Réalisations
(parallax média supprimé, cadrage CS-S5/CS-S5B restauré), et les reveals
qui ne rejouaient jamais (replay bidirectionnel via
`onEnter`/`onEnterBack`/`onLeave`/`onLeaveBack`). 3D non modifiée (hash
de build identique). Voir `CONTEXT.md` section 5.0bis. Prochaine étape :
validation visuelle humaine, puis décision sur CS-S8B.

**CS-S8 terminé — Motion system & profondeur globale (Home) GREEN techniquement.**

La Home dispose désormais d'un langage de mouvement unique et sobre
(GSAP/ScrollTrigger, script Astro non hydraté — `src/components/motion/`),
appliqué aux 7 sections existantes sans changer leur structure ni leur
copy : reveals légers, profondeur discrète (lignes qui se déploient,
micro-parallax, halo CTA), hover cohérents, `prefers-reduced-motion`
strictement respecté, mobile <900px simplifié. Coût mesuré : ~44 Ko
gzip, un seul chunk chargé uniquement sur `/`, aucune nouvelle
dépendance. Voir `CONTEXT.md` section 5.0. Prochaine étape : validation
visuelle humaine (Sébastien), puis décision sur CS-S8B.

**CS-S6F terminé — Terre reculée + orbite inclinée de la Lune GREEN techniquement.**

Nouveau besoin sur CS-S6E : la Lune ne doit jamais entrer en collision visuelle avec le Soleil. Deux ajustements combinés : la Terre est reculée du Soleil (rayon d'orbite +45%, réduisant par inégalité triangulaire la distance minimale possible Soleil↔Lune à un niveau quasi sans risque de chevauchement réel), et le plan orbital de la Lune est nettement plus incliné (axe transversal, ~60°) pour une lecture plus spatiale et moins de fréquence d'approche. Confirmé sur 8 captures réelles couvrant plusieurs révolutions complètes des deux orbites : aucune collision visuelle observée. Hiérarchie, scroll, lumières, reduced-motion et mobile strictement inchangés. Voir `CONTEXT.md` section 5.1terdecies. Prochaine étape : validation visuelle humaine (Sébastien).

Le projet dispose déjà de :

- Astro 7 ;
- TypeScript strict ;
- React prêt pour des îlots interactifs ;
- Three.js / React Three Fiber / Drei prêts pour les futures expériences 3D ;
- GSAP prêt pour les futurs effets de scroll et de parallaxe ;
- CSS natif + design tokens ;
- sitemap ;
- Content Collections ;
- pages de services ;
- pages de réalisations ;
- SEO de base ;
- accessibilité de base.

Validation CS-S0 :

- `npm run check` : **0 erreur, 0 warning, 0 hint** ;
- `npm run build` : **vert** ;
- **14 pages générées** ;
- **13 routes publiques** + page 404 ;
- aucune scène 3D active ;
- aucune animation GSAP active ;
- aucune hydratation React inutile.

### Prochaine étape

**Validation visuelle de Sébastien sur la Terre reculée / orbite inclinée de la Lune (CS-S6F), puis décision : garder les primitives, CS-S7 Blender, ou revoir le concept.**

---

## 🛠 Stack technique

| Couche | Technologie | Version / détail |
|---|---|---|
| Framework | Astro | `7.3.2` |
| Langage | TypeScript | `6.0.3` — strict |
| UI interactive | React | `19.2.8` |
| 3D | Three.js | `0.186.0` |
| 3D React | React Three Fiber | `9.7.0` |
| Helpers 3D | Drei | `10.7.8` |
| Motion | GSAP | `3.15.0` |
| SEO | Astro Sitemap | `3.7.4` |
| Styles | CSS natif | design tokens |
| Contenu | Astro Content Collections | réalisations |
| Rendu | Statique | SEO-first |

> React `19.2.8` est volontairement épinglé pour rester compatible avec la version actuelle de React Three Fiber. Ne pas faire de mise à jour globale sans vérifier cette compatibilité.

---

## 🏗 Architecture

```text
src/
├── components/
│   ├── layout/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   └── seo/
│       └── SeoHead.astro
│
├── content/
│   └── realisations/
│       ├── sereno.json
│       ├── agencyos.json
│       └── belkhir-depannage.json
│
├── content.config.ts
│
├── layouts/
│   └── BaseLayout.astro
│
├── pages/
│   ├── index.astro
│   ├── applications-metier-saas.astro
│   ├── sites-professionnels.astro
│   ├── developpement-sur-mesure.astro
│   ├── methode.astro
│   ├── a-propos.astro
│   ├── contact.astro
│   ├── mentions-legales.astro
│   ├── politique-confidentialite.astro
│   ├── 404.astro
│   └── realisations/
│       ├── index.astro
│       └── [slug].astro
│
└── styles/
    ├── global.css
    └── tokens.css
```

---

## 🗺 Routes publiques V1

```text
/
├── /applications-metier-saas/
├── /sites-professionnels/
├── /developpement-sur-mesure/
├── /realisations/
│   ├── /realisations/sereno/
│   ├── /realisations/agencyos/
│   └── /realisations/belkhir-depannage/
├── /methode/
├── /a-propos/
├── /contact/
├── /mentions-legales/
├── /politique-confidentialite/
└── /404
```

---

## 📁 Réalisations

La section `realisations` est alimentée par une **Astro Content Collection**.

Réalisations initiales :

### Sereno

Catégorie actuelle :
**Application métier / SaaS**

### AgencyOS

Catégorie actuelle :
**Application métier / SaaS**

### Belkhir Dépannage

Catégorie actuelle :
**Site professionnel**

Chaque entrée peut porter :

- titre ;
- résumé ;
- catégorie ;
- ordre ;
- technologies ;
- problème ;
- solution ;
- résultat ;
- title SEO ;
- description SEO.

Les textes marketing détaillés seront finalisés dans un sprint ultérieur.

Aucune métrique client ne doit être inventée.

---

## 🔎 SEO

Le socle actuel inclut :

- HTML statique ;
- `lang="fr"` ;
- title unique ;
- meta description unique ;
- canonical ;
- Open Graph minimal ;
- sitemap ;
- robots.txt ;
- H1 unique ;
- structure HTML sémantique.

Le domaine actuel :

```text
https://cantrelle-studio.example
```

est un placeholder réservé à la documentation.

Il devra être remplacé par le domaine réel avant publication.

Aucune donnée structurée `Organization` ne sera ajoutée tant que les informations juridiques réelles de l’entreprise ne sont pas connues.

---

## ♿ Accessibilité

Le socle prévoit déjà :

- navigation clavier native ;
- focus visible ;
- lien d’évitement ;
- structure sémantique ;
- H1 unique ;
- `prefers-reduced-motion`.

La future 3D devra rester optionnelle.

Le site devra toujours rester compréhensible sans WebGL ni animation.

---

## 🎨 Direction artistique

**Validée et propagée (CS-S2 → CS-S2C).**

> **Ingénierie numérique premium : claire, précise, profonde.**

- Graphite très sombre / ivoire, surfaces hiérarchisées, bordures fines ;
- Typographies : **Sora** (display) + **Manrope** (body/UI) ;
- Accent Ember : **`#E45F36`**, rare (hover, focus, CTA) ;
- Rayons 10–16px dominants ;
- Aucune dépendance à la 3D pour que la DA fonctionne.

À éviter :

- cyberpunk excessif ;
- agence marketing criarde ;
- portfolio développeur cliché ;
- effets gratuits ;
- animations au détriment de la lisibilité.

Détail complet : `CONTEXT.md` section 5.1bis et `docs/rapports/RAPPORT_CS_S2B_VALIDATION_VISUELLE.txt`.

---

## 🧊 3D et parallaxe

Three.js, React Three Fiber et GSAP sont installés mais volontairement non utilisés pour le moment.

Principe :

> la 3D est une couche d’expérience, jamais le socle du contenu.

Le futur Hero pourra représenter un système numérique modulaire autour de concepts comme :

- Web ;
- Application ;
- API ;
- Data ;
- SaaS ;
- Infrastructure.

Le prototype sera d’abord réalisé avec des primitives 3D simples.

Les assets Blender ne seront produits qu’après validation du concept.

---

## 🚀 Démarrage local

### Prérequis

- Node.js 22.x ;
- npm.

> Une dépendance transitive recommande actuellement Node `>=22.19.0`. Le projet a été validé sous Node `22.17.0`, mais une mise à jour de Node est recommandée à terme.

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Astro démarre ensuite le serveur local de développement.

### Vérification TypeScript / Astro

```bash
npm run check
```

### Build production

```bash
npm run build
```

### Preview du build

```bash
npm run preview
```

---

## 🧪 Qualité

État de référence CS-S0 :

| Contrôle | Résultat |
|---|---|
| `npm run check` | ✅ 0 erreur, 0 warning, 0 hint |
| `npm run build` | ✅ vert |
| Pages générées | ✅ 14 |
| Routes publiques | ✅ 13 |
| H1 unique | ✅ vérifié |
| `lang="fr"` | ✅ présent |
| Sitemap | ✅ généré |
| React inutilement hydraté | ✅ aucun |
| Three.js actif | ✅ non |
| GSAP actif | ✅ non |

---

## 📚 Documentation locale

Le projet utilise un répertoire local :

```text
docs/
├── prompts/
├── rapports/
├── brainstorm/
└── roadmap/
```

Ce dossier est ignoré par Git.

Il contient :
- prompts Claude Code ;
- rapports ;
- brainstorms ;
- roadmaps ;
- notes de travail.

La source de vérité opérationnelle versionnée reste :

[`CONTEXT.md`](./CONTEXT.md)

---

## 📋 Roadmap

### ✅ CS-S0 — Socle technique

- [x] Astro ;
- [x] TypeScript strict ;
- [x] React Islands prêt ;
- [x] Three / R3F / Drei installés ;
- [x] GSAP installé ;
- [x] sitemap ;
- [x] Content Collections ;
- [x] routes V1 ;
- [x] SEO de base ;
- [x] accessibilité de base ;
- [x] build vert.

### ✅ CS-S1 — Documentation

- [x] structure `docs/` ;
- [x] `CONTEXT.md` ;
- [x] `README.md`.

### ✅ CS-S2 / CS-S2B / CS-S2C — Direction artistique

- [x] personnalité de marque ;
- [x] palette ;
- [x] 2 polices (Sora + Manrope) ;
- [x] tokens V1 propagés ;
- [x] surfaces ;
- [x] focus / hover ;
- [x] responsive de base ;
- [ ] boutons/cards de production (CS-S4) ;
- [ ] règles de mouvement implémentées (CS-S6+).

### ✅ CS-S3 — Wireframe landing (verdict esthétique en attente)

- [x] Hero (2 zones, stage 3D statique) ;
- [x] offres (expertises) ;
- [x] différenciation (approche) ;
- [x] réalisations (Content Collection) ;
- [x] méthode ;
- [x] capacités techniques ;
- [x] CTA final.

### ✅ CS-S4 — Composants réutilisables (verdict esthétique en attente)

- [x] Header V1 (Services regroupés, CTA, sticky) ;
- [x] MobileNav accessible ;
- [x] Footer V1 (4 zones sobres) ;
- [x] ActionLink ;
- [x] Container ;
- [x] SectionHeading ;
- [x] ServiceItem ;
- [x] ProjectCard.

### ✅ CS-S5 — Landing statique (verdict esthétique en attente)

- [x] médias réels (Sereno, AgencyOS, Belkhir) ;
- [x] copy commerciale V1 ;
- [x] SEO Home mis à jour ;
- [x] responsive validé (1440 → 390px) ;
- [x] accessibilité (alt réels, lazy loading).

### ✅ CS-S5B — Correction visuelle Sereno

- [x] cause du vide identifiée (stretch Grid + height:100% + justify-content:flex-end) ;
- [x] correctif structurel (`align-self:start` + `height:auto`) limité au variant featured ;
- [x] AgencyOS / Belkhir inchangés ;
- [x] copy et médias inchangés ;
- [x] 3 mutations de contrôle passées.

### ⚠️ CS-S6 — Prototype Hero 3D (sculpture) — direction abandonnée sur verdict humain, voir CS-S6B

### ✅ CS-S6B — Refonte Hero 3D : trois billes métalliques

- [x] 3 sphères métalliques satinées + filaments de vent ;
- [x] cadres/lignes CSS parasites supprimés (pas masqués) ;
- [x] fond fixe plein viewport, jamais au-dessus du contenu (vérifié) ;
- [x] transition droite → centre pilotée par le scroll ;
- [x] dynamique accrue au scroll actif puis relâchement doux ;
- [x] reduced motion (pose stable confirmée) ;
- [x] mobile inchangé (aucun chunk 3D sous 900px).

### ✅ CS-S6C — Ajustements ciblés : matière, reflets, vitesse, gravité

- [x] rig d'environnement procédural (Drei Environment + Lightformer, aucune HDRI, aucune dépendance) ;
- [x] matériau ajusté (roughness/metalness/envMapIntensity) ;
- [x] vitesse ~x3,6 fréquence / x1,7 amplitude ;
- [x] respiration de groupe synchronisée + répulsion douce (remplacée par CS-S6D) ;
- [x] scroll et reduced-motion strictement inchangés ;
- [x] aucune régression Header/Footer/Réalisations.

### ✅ CS-S6D — Direction orbitale symbolique + lumières renforcées

- [x] hiérarchie orbitale grosse (centre) → moyenne (orbite la grosse) → petite (orbite la moyenne) ;
- [x] rayons d'orbite constants, garantis sans chevauchement par construction ;
- [x] lumières et environnement de réflexion fortement intensifiés ;
- [x] hiérarchie de vitesses respectée (grosse la plus calme, petite la plus vive) ;
- [x] scroll, reduced-motion, mobile strictement inchangés ;
- [x] aucune régression Header/Footer/Réalisations.

### ✅ CS-S6E — Ellipse propre du "soleil"

- [x] grosse sphère animée par une vraie ellipse (demi-axes distincts) ;
- [x] inclinaison exacte de 25° par rotation rigide, pas déformée ;
- [x] la plus lente et calme du système (respecte son rôle de centre) ;
- [x] moyenne/petite inchangées, héritent du mouvement via composition ;
- [x] scroll, reduced-motion, lumières, mobile strictement inchangés ;
- [x] aucune régression Header/Footer/Réalisations.

### ✅ CS-S6F — Terre reculée + orbite inclinée de la Lune (verdict humain en attente)

- [x] Terre reculée du Soleil (rayon d'orbite +45%) ;
- [x] borne géométrique de distance Soleil↔Lune quasi au niveau du contact réel ;
- [x] plan orbital de la Lune nettement plus incliné (~60°, axe transversal) ;
- [x] répulsion douce renforcée en filet de sécurité résiduel ;
- [x] aucune collision visuelle observée sur 8 captures / plusieurs révolutions ;
- [x] hiérarchie, scroll, lumières, mobile, reduced-motion strictement inchangés.

### ⏳ CS-S7 — Blender

Uniquement si le prototype valide le besoin d’assets custom.

### ✅ CS-S8 — Motion system & profondeur globale (Home) (verdict esthétique en attente)

- [x] langage de mouvement unique (durées/easing/stagger centralisés) ;
- [x] script Astro non hydraté, GSAP/ScrollTrigger, aucune île React ;
- [x] reveals légers sur les 7 sections, structure et copy inchangées ;
- [x] profondeur discrète (ligne Expertises, micro-parallax Réalisations,
      ligne de progression Méthode, halo CTA final) ;
- [x] hover cohérents (liens, boutons, cards, plaques, groupes) ;
- [x] `prefers-reduced-motion` strictement respecté (39/39 éléments) ;
- [x] mobile <900px simplifié (parallax/scrub désactivés) ;
- [x] contenu jamais dépendant du JS pour exister ;
- [x] aucune nouvelle dépendance, bundle mesuré (~44 Ko gzip, `/` uniquement) ;
- [x] 3 mutations de contrôle passées et restaurées sans trace.

### ✅ CS-S8A — Fix dev + replay reveals + restauration médias (verdict esthétique en attente)

- [x] `npm run dev` corrigé (cause exacte identifiée : balise `<script>`
      littérale dans un commentaire, piégeant le scanner Vite) ;
- [x] HMR revérifié fonctionnel ;
- [x] parallax média Réalisations supprimé, cadrage CS-S5/CS-S5B restauré ;
- [x] reveals rejouent désormais dans les deux sens (descente/remontée) ;
- [x] hover fonctionnel après replay, halo CTA jamais dupliqué ;
- [x] reduced-motion, no-JS, mobile strictement intacts ;
- [x] 3D prouvée non modifiée (hash de build identique) ;
- [x] aucune nouvelle dépendance ;
- [x] 3 mutations de contrôle passées et restaurées sans trace.

### ✅ CS-S8B — Surfaces & composants premium (verdict esthétique en attente)

- [x] Expertises en "plaques éditoriales techniques" (hover/focus premium) ;
- [x] Approche en architecture (index, profondeur ±3px, halo local) ;
- [x] Réalisations affinée sans changer layout/médias/parallax ;
- [x] Méthode en rail horizontal (desktop) + timeline verticale (mobile) ;
- [x] Capacités en "board technique" avec séparateurs, phrase de clôture
      renforcée ;
- [x] CTA final en panneau de conclusion premium (surface Level 3) ;
- [x] aucune nouvelle copy, aucune nouvelle dépendance ;
- [x] 3D et motion system strictement préservés (hash identiques) ;
- [x] replay bidirectionnel revérifié (3 cycles × 6 sections) ;
- [x] 3 mutations de contrôle passées et restaurées sans trace.

### ✅ CS-S9 — Pages services (verdict esthétique et commercial en attente)

- [x] `/applications-metier-saas/`, `/sites-professionnels/`,
      `/developpement-sur-mesure/` : vraies landings SEO/commerciales ;
- [x] title/meta/canonical uniques, 1 H1/page, aucun noindex ;
- [x] preuves honnêtes (Sereno/AgencyOS/Belkhir réutilisés, MyDashServ/
      BeatStudio/GlassTrack/Vélocéan sourcés, GlassTrack et Vélocéan
      toujours étiquetés "Démonstrateur") ;
- [x] composition visuelle distincte par page (chaîne / triptyque / hub) ;
- [x] maillage interne complet (/contact/, /methode/, /realisations/,
      1 autre service) ;
- [x] aucun FAQPage JSON-LD, FAQ en `<details>` natif sans JS ;
- [x] zéro nouvelle dépendance, JS ajouté = 0 ;
- [x] Home/3D/motion system strictement préservés (hash identiques) ;
- [x] 3 mutations de contrôle passées et restaurées sans trace.

### ✅ CS-S9B — Pages services premium + médias + motion léger (verdict esthétique et commercial en attente)

- [x] captures réelles Sereno/AgencyOS/Belkhir affichées sur les pages
      services elles-mêmes ;
- [x] captures réelles supplémentaires Ink Red Plumes, MyDashServ,
      BeatStudio, Vélocéan (portfolio public + démonstrations GitHub
      Pages, sources autorisées) ;
- [x] grille de preuves asymétrique (Applications), nouvelle section
      "Mode de collaboration" (Sur mesure) ;
- [x] motion léger cohérent avec la Home (`ServiceMotion.astro`, reveal
      + replay bidirectionnel), composant séparé ne touchant pas
      `HomeMotion.astro` ;
- [x] aucune nouvelle dépendance, Hero 3D et Home non modifiés ;
- [x] responsive (1440/390px) et no-JS vérifiés, aucune régression.

### ✅ CS-S10 — Études de cas premium : Sereno / AgencyOS / Belkhir (verdict esthétique et narratif en attente)

- [x] les 3 pages `/realisations/[slug]/` réécrites en véritables études
      de cas (problème → réflexion → solution → démonstration → choix
      techniques → résultat réel → ce que ça démontre) ;
- [x] composition centrale distincte par projet (timeline Sereno, grille
      de modules AgencyOS, blocs éditoriaux Belkhir) — jamais 3 pages
      clones ;
- [x] 16 médias réels au total (portfolio public + démonstration live
      Belkhir), cadrés sans recadrage destructeur (`object-fit:
      contain`) ;
- [x] zéro métrique business inventée ; statut Belkhir honnête (projet
      client en validation, jamais présenté "en production") ;
- [x] motion réutilisé tel quel depuis CS-S9B (`ServiceMotion.astro`),
      aucun nouveau moteur de motion ni nouveau chunk JS ;
- [x] aucune nouvelle dépendance, Home/3D/motion Home/Header/Footer/
      pages Services non modifiés (hash de chunk + mtime confirmés) ;
- [x] responsive (1440/1024/390px), accessibilité, no-JS, SEO on-page
      et 3 mutations négatives vérifiés, aucune régression.

### ✅ CS-S10B — Connexions Services ↔ Études de cas (verdict UX/commercial en attente)

- [x] mapping central unique `serviceCaseStudyMap.ts` (aucune donnée
      dupliquée, tout relu depuis la Content Collection et
      `caseStudyContent.ts`) ;
- [x] Applications métier & SaaS : preuve phare Sereno, secondaire
      AgencyOS (hiérarchie visuelle respectée) ;
- [x] Sites professionnels : preuve phare unique Belkhir Dépannage ;
- [x] Développement sur mesure : preuve phare AgencyOS, secondaire
      Sereno (choix justifié dans le rapport) ;
- [x] chaque étude affiche son Service associé (principal), AgencyOS
      affiche en plus un Service connexe discret (Sur mesure) ;
- [x] CTA de fin d'étude réduit à 2 actions maximum ;
- [x] budget de liens respecté (≤3 blocs promotionnels par page
      Service) ;
- [x] aucune nouvelle dépendance, Home/3D/motion Home non modifiés
      (hash de chunk confirmé) ;
- [x] 4 parcours de navigation, responsive (1440/1024/390px),
      accessibilité, no-JS et 3 mutations négatives vérifiés.

---

## 👤 Fondateur

### Sébastien Cantrelle

Développeur Full Stack  
Applications métier · SaaS · Web professionnel

Cantrelle Studio est actuellement construit comme un studio pouvant fonctionner avec une seule personne aujourd’hui et évoluer vers une équipe demain.

---

*Cantrelle Studio · Projet en cours · 2026*
