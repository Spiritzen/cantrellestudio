# CONTEXT.md — Cantrelle Studio

> Document d’onboarding destiné à Sébastien, aux assistants IA et aux personnes amenées à intervenir sur **Cantrelle Studio**.
>
> **État de référence vérifié :** CS-S0 → CS-S2C terminés en `GREEN`, 12 septembre 2026 (socle technique + Design Foundations propagées).
>
> Ce document sépare volontairement quatre notions qui ne doivent jamais être confondues : **positionnement commercial**, **socle technique livré**, **direction artistique**, **travaux futurs**.

---

## 0. Comment utiliser ce document

Ce fichier donne la carte du territoire. Il ne remplace ni le code, ni les validations techniques, ni les rapports de sprint.

En cas de contradiction, l’ordre d’autorité est le suivant :

1. le code réellement présent dans le projet ;
2. les résultats de `npm run check` et `npm run build` exécutés sur cet état ;
3. le présent `CONTEXT.md` ;
4. le `README.md` ;
5. les rapports de sprint ;
6. les prompts, brainstorms et notes locales stockés sous `docs/`.

Les prompts et rapports racontent l’historique du projet et expliquent certaines décisions, mais ils ne doivent jamais être considérés seuls comme preuve de l’état actuel.

Avant toute intervention importante :

- lire ce fichier ;
- lire le `README.md` ;
- inspecter les fichiers réellement concernés ;
- vérifier le périmètre exact du micro-sprint ;
- préserver les choix déjà validés ;
- ne jamais élargir spontanément le périmètre ;
- annoncer toute hypothèse qui n’est pas confirmée par le code.

---

## 1. Cantrelle Studio en une phrase

**Cantrelle Studio est un studio de développement orienté applications métier, SaaS, sites professionnels et solutions numériques sur mesure, avec une approche où la technologie est choisie en fonction du besoin métier — pas l’inverse.**

Le site ne doit pas être conçu comme un portfolio recruteur.

Le portfolio personnel répond à :

> « Pourquoi recruter Sébastien ? »

Cantrelle Studio doit répondre à :

> « Pourquoi confier mon projet numérique à ce studio ? »

Cette différence commande toute la conception du site.

---

## 2. Positionnement commercial

### 2.1 Cible principale

- PME ;
- porteurs de projets ayant un vrai besoin logiciel ;
- structures qui ont besoin d’un outil métier, d’un SaaS ou d’une solution numérique spécifique.

### 2.2 Cible secondaire

- TPE ;
- indépendants ;
- artisans ;
- professions libérales ;
- structures ayant besoin d’un site professionnel performant et orienté SEO.

### 2.3 Pyramide d’offres

#### Pôle phare

**Applications métier & SaaS**

Exemples :
- CRM ;
- tableaux de bord ;
- facturation ;
- workflows ;
- automatisation ;
- rôles et permissions ;
- API ;
- portails ;
- outils internes ;
- SaaS multi-utilisateurs ;
- SaaS multi-tenant.

#### Offre d’entrée

**Sites professionnels**

Exemples :
- sites vitrines ;
- SEO technique ;
- performance ;
- responsive ;
- architecture de contenu ;
- pages métier ;
- expériences visuelles premium.

#### Offre transversale

**Développement sur mesure**

Exemples :
- API et intégrations ;
- automatisation ;
- ajout de fonctionnalités ;
- modernisation ;
- refonte technique ;
- évolution d’un produit existant.

---

## 3. Principe de marque

Principe validé :

> **La technologie s’adapte au projet, pas l’inverse.**

Ce principe décrit la méthode du studio.

Il ne doit pas être utilisé automatiquement comme H1 ou slogan principal sans validation éditoriale.

Le client doit d’abord comprendre :
- ce que le studio peut résoudre ;
- pour qui ;
- avec quelle méthode ;
- pourquoi il peut faire confiance au studio.

Les technologies servent ensuite de preuve.

---

## 4. Posture de marque

Nom de travail actuel :

**Cantrelle Studio**

Ce nom est encore considéré comme un nom de travail tant qu’aucune validation juridique, commerciale ou de disponibilité de domaine n’a été faite.

Posture recommandée :

- le studio parle de manière professionnelle et transparente ;
- éviter le « nous » lorsqu’il pourrait faire croire qu’une équipe permanente existe déjà ;
- utiliser des formulations neutres : « le studio conçoit », « chaque projet », etc. ;
- lorsque Sébastien parle comme fondateur, le « je » est assumé ;
- le site peut évoluer demain vers une équipe sans devoir être entièrement repensé.

Formulation de référence :

> **Studio fondé par Sébastien Cantrelle.**

---

## 5. État réel du projet

### 5.0septies CS-S10B — Connexions Services ↔ Études de cas

Statut : **GREEN techniquement**. Verdict UX/commercial en attente de
la validation de Sébastien.

Rend explicite et bidirectionnelle la relation entre les 3 pages
Services et les 3 études de cas, via une source de vérité unique
(`src/data/serviceCaseStudyMap.ts` : slug service, slug projet, rôle
primary/secondary sur la page Service, rôle principal/connexe sur la
page projet, phrase de contexte courte — jamais de titre/résumé/média
dupliqué, tout est relu depuis `caseStudyContent.ts`/`projectMedia.ts`).
Mapping : Applications métier & SaaS (phare Sereno, secondaire
AgencyOS), Sites professionnels (phare unique Belkhir Dépannage),
Développement sur mesure (phare AgencyOS, secondaire Sereno — choix
justifié dans le rapport par l'angle modularité/intégration de cette
page). Chaque étude affiche désormais son "Service associé" (principal)
sous le Hero, et AgencyOS affiche en plus un "Service connexe"
(Développement sur mesure) volontairement discret.

2 nouveaux composants sous `src/components/relations/`
(`RelatedCaseStudy.astro` pour les pages Services, `RelatedService.astro`
pour les pages d'études), grammaire commune sobre (label "Étude de cas",
media en `object-fit: contain`, jamais de crop destructeur). Pour
respecter le test anti-surcharge (≤3 blocs promotionnels par page une
fois les études de cas ajoutées), Ink Red Plumes/BeatStudio/MyDashServ
ont été retirés de certaines pages Services (données conservées,
simplement non affichées — voir rapport). CTA de fin d'étude réduit à
2 actions maximum. Aucune nouvelle dépendance, Home/3D/motion Home/
Header/Footer non modifiés (hash de chunk identique). Rapport détaillé :
`docs/rapports/rapport_cs_s10b_connexions_services_case_studies.txt`.

Prochaine étape : validation UX et commerciale de Sébastien.

### 5.0sexies CS-S10 — Études de cas premium : Sereno / AgencyOS / Belkhir

Statut : **GREEN techniquement**. Verdict esthétique/narratif en
attente de la validation de Sébastien.

Transforme les 3 pages `/realisations/[slug]/` (placeholder CS-S0 :
H1 nu + 3 paragraphes plats) en vraies études de cas premium : problème
→ réflexion → solution → démonstration visuelle → choix techniques →
résultat réel → ce que ça démontre → projet suivant. Composition
centrale structurellement différente par projet — timeline horizontale
5 étapes pour Sereno, grille de modules produit pour AgencyOS, blocs
éditoriaux alternés média/texte pour Belkhir — jamais 3 pages clones.
4-6 médias réels par projet (16 au total), sourcés du portfolio public
de l'utilisateur et de la démonstration live Belkhir, cadrés sans jamais
recadrer destructivement (`object-fit: contain`, leçon CS-S8A). Zéro
métrique business inventée ; statut Belkhir explicitement honnête
("projet de refonte pour un client réel, en validation", jamais
"en production").

6 composants créés sous `src/components/case-studies/` (maximum
autorisé), narration bespoke dans `src/data/caseStudyContent.ts`
(la Content Collection `realisations` garde son schéma existant,
volontairement non étendu). Motion réutilisé tel quel depuis CS-S9B
(`ServiceMotion.astro`, sélecteur élargi d'une ligne) : zéro nouveau
moteur de motion, zéro nouveau chunk JS. Home, 3D, motion Home, Header,
Footer, pages Services non modifiés (hash de chunk + mtime confirmés
identiques). Aucune nouvelle dépendance. Rapport détaillé :
`docs/rapports/rapport_cs_s10_etudes_de_cas_premium.txt`.

Prochaine étape : validation visuelle et narrative de Sébastien.

### 5.0quinquies CS-S9B — Pages services premium + médias + motion léger

Statut : **GREEN techniquement**. Verdict esthétique/commercial en
attente de la validation de Sébastien.

Élève les 3 pages services (CS-S9) au niveau visuel de la Home/CS-S8B,
sans refonte de structure ni de copy SEO : ajout de vraies captures
d'écran (Sereno/AgencyOS/Belkhir désormais affichés sur les pages
services elles-mêmes ; Ink Red Plumes, MyDashServ, BeatStudio et
Vélocéan récupérés depuis le portfolio public de l'utilisateur et les
démonstrations GitHub Pages associées, sources explicitement
autorisées), grille de preuves asymétrique sur Applications, nouvelle
section "Mode de collaboration" sur Sur mesure, et un motion léger
cohérent avec la Home (`ServiceMotion.astro`, reveal + replay
bidirectionnel, mêmes constantes que `motionUtils.ts`) — composant
entièrement séparé qui n'importe ni ne modifie `HomeMotion.astro`.

Hero 3D, Home, Header, Footer strictement non modifiés (le hash du
chunk `HomeMotion` a changé, mais uniquement parce que Vite a extrait
`motionUtils`/GSAP dans un chunk partagé désormais aussi utilisé par
les pages services — le fichier source `HomeMotion.astro` est resté
identique caractère pour caractère). Aucune nouvelle dépendance.
Rapport détaillé :
`docs/rapports/rapport_cs_s9b_pages_services_premium_medias_motion.txt`.

Prochaine étape : validation visuelle et commerciale de Sébastien.

### 5.0quater CS-S9 — Pages services : 3 landings SEO / commerciales

Statut : **GREEN techniquement**. Verdict esthétique et commercial en
attente de la validation de Sébastien.

Les 3 routes existantes (`/applications-metier-saas/`,
`/sites-professionnels/`, `/developpement-sur-mesure/`), jusque-là en
contenu provisoire CS-S0, deviennent de vraies landings SEO/
commerciales, chacune avec une composition centrale distincte
(chaîne verticale d'architecture pour Applications, triptyque
"trouvé/compris/contacté" pour Sites, diagramme hub pour Sur mesure)
tout en gardant l'identité DA commune (graphite/ivoire/Ember, Sora/
Manrope). Aucune nouvelle copy inventée : chaque fait cité sur Sereno/
AgencyOS/Belkhir provient de la Content Collection existante, chaque
fait sur MyDashServ/Ink Red Plumes/BeatStudio/GlassTrack/Vélocéan
provient du Source Pack du prompt (centralisé dans
`src/data/serviceProofs.ts`) — GlassTrack et Vélocéan affichent
toujours un badge "Démonstrateur", jamais présentés comme clients.

4 composants créés sous `src/components/services/` (ServiceHero,
ServiceProofCard, ServiceCta, ServiceBreadcrumb), CSS namespacé dans
`src/styles/services.css` (chunk séparé, coût nul sur la Home). Zéro JS
ajouté (FAQ en `<details>/<summary>` natif), zéro nouvelle dépendance,
Home/3D/motion system/Header/Footer strictement non modifiés (hash de
build identiques). SEO on-page complet : title/meta/canonical uniques,
1 H1/page, aucun noindex, sitemap à jour, maillage interne vers
/contact/, /methode/, /realisations/ et un autre service sur chaque
page. Rapport détaillé :
`docs/rapports/rapport_cs_s9_pages_services_seo_commerciales.txt`.

Prochaine étape : validation visuelle et commerciale de Sébastien.

### 5.0ter CS-S8B — Surfaces & composants premium

Statut : **GREEN techniquement**. Verdict esthétique en attente de la
validation visuelle de Sébastien.

Sprint compositionnel (CSS/HTML, aucun JS ajouté) répondant au constat
"la Home est encore trop à lire" sans transformer les sections en cards
SaaS génériques :

- **Expertises** : chaque module devient une "plaque éditoriale
  technique" (bordure complète fine, surface Level 1, repère supérieur
  numéro + ligne graphite), hover/focus premium (translateY -3px,
  Ember sur le repère, jamais de scale/glow/tilt).
- **Approche** : index décoratifs 01/02/03 sur les 3 principes, léger
  décalage de profondeur architectural (±3px), halo Ember très localisé
  derrière la colonne, compatible avec le reveal GSAP via le pattern
  `clearProps` déjà éprouvé.
- **Réalisations** : très peu de changements (comme demandé) — un
  léger "border light" Ember au hover (CSS pur), label catégorie mieux
  posé, séparation média/copy affinée. Layout, ratios, médias et
  parallax (supprimé en CS-S8A) strictement inchangés.
- **Méthode** : refonte visuelle en "rail éditorial horizontal" avec
  marqueurs (desktop) et "timeline verticale" avec médaillons (mobile/
  tablette) — la ligne de progression scrub existante est conservée
  telle quelle.
- **Capacités** : chaque groupe affiche un index, ses technologies sur
  des lignes séparées par des séparateurs (même texte, juste redécoupé),
  phrase de clôture renforcée visuellement (fragment Ember, sans
  changer un mot).
- **CTA final** : devient un vrai "panneau de conclusion" (surface
  Level 3, bordure fine, radius 16px), le halo Ember existant (motion
  géré par CS-S8, non touché) déborde autour du panneau.

Aucune nouvelle copy, aucune nouvelle dépendance, 3D et motion system
strictement préservés (hash de build identiques pour `HeroScene` et
`HomeMotion`). Replay bidirectionnel revérifié fonctionnel sur les 6
sections (3 cycles chacune), reduced-motion et no-JS intacts, mobile
testé aux 8 largeurs. Rapport détaillé :
`docs/rapports/rapport_cs_s8b_surfaces_composants_premium.txt`.

Prochaine étape : validation visuelle de Sébastien, puis décision sur
la suite.

### 5.0bis CS-S8A — Fix dev + replay reveals + restauration médias

Statut : **GREEN techniquement**. Verdict esthétique en attente de la
validation visuelle de Sébastien.

Corrige 3 problèmes précis signalés sur CS-S8, sans étendre le scope et
sans toucher à la 3D :

- **`npm run dev` cassé** : le frontmatter de `HomeMotion.astro`
  contenait la séquence littérale `<script type="module">` DANS UN
  COMMENTAIRE (exemple textuel) ; le scanner de dépendances de Vite
  (actif uniquement en `astro dev`, jamais en `astro build` — d'où le
  "build vert / dev rouge") l'a détectée comme une vraie balise et a
  découpé un module virtuel invalide à partir de là. Corrigé en
  reformulant le commentaire sans balise angle-bracket littérale.
- **Médias Réalisations trop zoomés** : le sur-cadrage introduit par
  CS-S8 pour le micro-parallax (`position:absolute; inset:-8px 0`)
  rendait les captures Sereno/AgencyOS/Belkhir moins lisibles. Le
  parallax média est supprimé, le cadrage exact de CS-S5/CS-S5B est
  restauré (lisibilité des preuves produit > effet de profondeur,
  arbitrage explicite).
- **Reveals one-shot** : remplacé par un replay bidirectionnel
  (`ScrollTrigger.create` avec `onEnter`/`onEnterBack` → rejoue,
  `onLeave`/`onLeaveBack` → réinitialise) sur toutes les sections
  scrollées ; Hero volontairement laissé one-shot (documenté, pour ne
  jamais interférer avec la logique de scroll interne de la 3D).

3D (`HeroSpheres.tsx`/`HeroScene.tsx`) prouvée non modifiée (hash de
build identique à CS-S8). Aucune nouvelle dépendance. Rapport détaillé :
`docs/rapports/rapport_cs_s8a_fix_replay_media_dev.txt`.

Prochaine étape : validation visuelle de Sébastien, puis décision sur
CS-S8B.

### 5.0 CS-S8 — Motion system & profondeur globale (Home)

Statut : **GREEN techniquement**. Verdict esthétique en attente de la
validation visuelle de Sébastien.

La Home passe d'une landing statique à une expérience animée cohérente,
via UN seul langage de mouvement appliqué aux 7 sections existantes
(Hero, Expertises, Approche, Réalisations, Méthode, Capacités, CTA
final) — structure, ordre des sections et copy CS-S5 strictement
inchangés.

Architecture : `src/components/motion/motionUtils.ts` (constantes
DURATION/EASE/STAGGER/OFFSET partagées, un seul easing "power2.out") +
`src/components/motion/HomeMotion.astro` (script Astro pur, aucune île
React, aucune hydratation — GSAP 3.15.0 + ScrollTrigger, déjà installés
depuis CS-S0, jamais utilisés jusqu'ici). Reveals légers
(opacity+translation 10-24px), profondeur limitée (ligne qui se
déploie, micro-parallax médias ±6px desktop uniquement, ligne de
progression Méthode, halo CTA qui respire lentement), hover sobres
(translation ≤4px). `prefers-reduced-motion` : aucune animation créée,
contenu déjà visible par défaut (vérifié sur 39 éléments). Mobile <900px :
parallax et scrub désactivés, reveal léger conservé. Contenu jamais
dépendant du JS pour exister (vérifié en HTML/CSS statique compilés).

Coût : un seul chunk dédié (~44 Ko gzip, GSAP+ScrollTrigger+code motion
inclus), chargé uniquement par `/`. Aucune nouvelle dépendance. Deux
bugs GSAP non triviaux rencontrés et corrigés en cours de sprint (voir
rapport). Batterie complète passée : check/build verts, 10 routes HTTP
vérifiées, régression complète (H1/sections/Header/Footer/Sereno-
AgencyOS-Belkhir/3D orbital/mobile nav/Design Lab/sitemap) sans écart,
3 mutations négatives (reduced-motion désactivé, contenu invisible sans
JS, scroll-jacking) confirmées RED puis restaurées sans trace.

Un seul fichier créé en plus des deux ci-dessus : aucun — voir rapport
pour la liste exhaustive des fichiers modifiés (index.astro, home.css,
ServiceItem/ProjectCard/SectionHeading/ActionLink.astro, Footer.astro).
`HeroSpheres.tsx`/`HeroScene.tsx` (3D orbitale) et `/design-lab/`
non touchés. Rapport détaillé :
`docs/rapports/rapport_cs_s8_motion_profondeur_globale.txt`.

Prochaine étape : validation visuelle de Sébastien, puis décision sur
CS-S8B.

### 5.1terdecies CS-S6F — Terre reculée + orbite inclinée de la Lune

Statut : **GREEN techniquement**. Verdict visuel en attente de la
validation de Sébastien.

Nouveau besoin produit sur CS-S6E : la Lune ne doit jamais entrer en
collision visuelle avec le Soleil. Deux ajustements combinés :

- **Terre reculée du Soleil** : rayon d'orbite porté de 1.0 à 1.45
  (+45%). Par inégalité triangulaire, la distance Soleil↔Lune ne peut
  jamais descendre sous |rayon Terre − rayon Lune| — cette borne passe
  de 0,28 à 0,73 unité, quasiment au niveau du seuil de contact réel
  (0,72), rendant un chevauchement réel des surfaces quasi impossible
  même dans le pire cas.
- **Plan orbital de la Lune nettement plus incliné** : angle porté de
  0,7 à 1,05 rad (~60°), axe changé pour un axe plus transversal
  (profondeur). Réduit la fréquence des approches proches et enrichit la
  lecture spatiale de l'orbite lunaire (positions variées en profondeur,
  pas un simple cercle plat).
- Le filet de répulsion douce (hérité de CS-S6C) voit sa marge relevée
  (0,12→0,16) pour absorber le reliquat théorique résiduel de 0,15 unité
  — une correction bien plus fine qu'avant ce sprint (0,56 unité de
  dépassement possible auparavant).

Confirmé par 8 captures réelles sur ~32s (plusieurs révolutions
complètes des deux orbites) : aucune collision visuelle observée, la
Terre paraît nettement plus éloignée, la Lune montre des positions
variées en profondeur. Aucun changement de la hiérarchie de composition,
du Soleil (ellipse CS-S6E inchangée), du scroll, des lumières, du mobile
ou du reduced-motion.

Un seul fichier modifié : `src/components/hero/HeroSpheres.tsx`. Rapport
détaillé : `docs/rapports/rapport_cs_s6f_terre_lune_orbite_inclinee.txt`.

### 5.1duodecies CS-S6E — Ellipse propre du "soleil"

Statut : **GREEN techniquement, distance Terre/Soleil et orbite de la
Lune ajustées par CS-S6F.** Voir section 5.1terdecies.

Verdict humain sur CS-S6D : la hiérarchie orbitale est la bonne
direction, mais la grosse sphère ("le soleil") restait trop immobile —
elle ne semblait réagir que par ricochet des autres sphères. Sébastien
demande explicitement qu'elle suive sa propre ellipse de déplacement,
inclinée d'environ 25° pour une trajectoire diagonale.

- La grosse sphère suit désormais une **vraie ellipse** (demi-axes
  distincts 0.32/0.16, pas un cercle), construite à plat puis inclinée
  par une rotation rigide de 25° autour de l'axe caméra — une rotation
  préserve exactement la forme, contrairement à des sinus indépendants
  par axe qui l'auraient déformée. Vitesse la plus lente du système
  (0.22 rad/s, période ~28,6s) : elle reste la sphère la plus calme.
- Moyenne et petite continuent d'orbiter respectivement la grosse et la
  moyenne SANS aucun changement de leur propre logique (constantes de
  CS-S6D non touchées) — elles héritent simplement du nouveau mouvement
  du centre via la composition de positions déjà en place, exactement
  l'effet demandé ("le centre bouge, les autres héritent d'un système
  plus vivant").
- Confirmé par 5 captures réelles espacées de 3,5s : déplacement net et
  continu de la grosse sphère, entraînant toute la composition dans une
  dérive diagonale cohérente. H1 toujours parfaitement lisible.
- Scroll, reduced-motion, lumières, mobile : strictement inchangés.

Un seul fichier modifié : `src/components/hero/HeroSpheres.tsx`. Rapport
détaillé : `docs/rapports/rapport_cs_s6e_ellipse_soleil.txt`.

### 5.1undecies CS-S6D — Direction orbitale symbolique + lumières renforcées

Statut : **GREEN techniquement, mouvement du centre ajusté par CS-S6E.**
Voir section 5.1duodecies.

Verdict humain sur CS-S6C : progrès reconnu, mais billes encore trop
noires, reflets encore trop faibles, mouvement sans sens symbolique.
Sébastien propose une lecture orbitale (grosse = Soleil, moyenne orbite
la grosse comme la Terre, petite orbite la moyenne comme la Lune) — piste
validée et implémentée :

- **Lumières fortement renforcées** : intensités de toutes les sources
  (ambiante, clé, rim, point Ember) et des 4 lightformers de l'environnement
  procédural relevées de 40 à 80 % selon les cas, `envMapIntensity` du
  matériau montée à 2.0, résolution de l'environnement 64→96. Aucun
  changement structurel (toujours pas de HDRI, pas de shadow map, pas de
  post-processing). Confirmé par capture réelle : sphères nettement moins
  noires, reflets multiples et bien plus lisibles.
- **Mouvement remplacé par une vraie hiérarchie orbitale** (remplace
  l'ancienne "respiration de groupe" de CS-S6C) : la grosse sphère est un
  centre de gravité quasi stable (légère dérive 3 axes), la moyenne
  orbite la grosse à rayon constant (~12,6s/tour), la petite orbite la
  position courante de la moyenne à rayon constant et vitesse plus vive
  (~3,3s/tour) — elle hérite donc indirectement du mouvement des deux
  autres. Les rayons d'orbite sont calculés pour toujours dépasser la
  somme des rayons de sphères + une marge, garantissant l'absence de
  chevauchement par construction géométrique (pas une simulation
  physique). La répulsion douce de CS-S6C reste un filet de sécurité.
- Scroll (droite→centre, fond permanent) et reduced-motion strictement
  inchangés dans leur principe. Header/Footer/Réalisations (Sereno
  toujours 41px) intacts.

Un seul fichier modifié : `src/components/hero/HeroSpheres.tsx`. Rapport
détaillé : `docs/rapports/rapport_cs_s6d_direction_orbitale_symbolique.txt`.

### 5.1decies CS-S6C — Ajustements ciblés des billes (matière, reflets, vitesse, gravité)

Statut : **GREEN techniquement, remplacée conceptuellement par CS-S6D
pour le mouvement (lumières encore renforcées ensuite)**. Voir section
5.1undecies.

Verdict humain sur CS-S6B : "c'est beaucoup mieux", mais billes trop
noires/impression de transparence, reflets pas assez premium, mouvement
trop faible, interaction entre billes insuffisante. CS-S6C corrige
ces 4 points par ajustements ciblés, SANS toucher au concept, à la
composition, au comportement de scroll ni aux filaments :

- **Cause réelle identifiée** (pas supposée) du problème "trop noires/
  transparentes" : les sphères n'avaient AUCUN environnement
  (`scene.environment`) à réfléchir — un matériau à haut `metalness` sans
  environnement reste proche du noir hors lumière directe, et sa face non
  éclairée se confond visuellement avec le fond de page quasi identique
  (`#0A0B0D`). Corrigé par un **rig d'environnement 100% procédural**
  (`<Environment resolution={64} frames={1}>` + 4 `<Lightformer>` de
  Drei, déjà installé) — aucune HDRI (aucune n'existe dans le projet,
  vérifié avant de coder ; consigne explicite de ne pas en télécharger),
  bake unique au montage, aucun coût par frame, aucune nouvelle
  dépendance. Matériau ajusté en complément : couleur légèrement
  éclaircie, roughness abaissée (0.38→0.28) pour des reflets plus nets,
  metalness et envMapIntensity relevés.
- **Vitesse** : facteur ~x3,6 sur la fréquence des orbites individuelles
  (périodes 15-28s → 4-6s) et ~x1,7 sur leur amplitude — dans la
  fourchette x2-x6 demandée, mouvement désormais clairement visible entre
  deux captures à 1,5s d'écart (contre quasi imperceptible avant).
- **Gravité/interaction** : une "respiration" de groupe synchronisée
  (une seule sinusoïde partagée par les 3 sphères, appliquée le long du
  vecteur base→centre propre à chacune) donne l'impression qu'elles
  appartiennent à un même système, plus une répulsion douce (sécurité
  géométrique, pas une force) qui empêche tout chevauchement visuel.
  Aucune simulation physique.
- Scroll et reduced-motion strictement inchangés (revérifiés identiques).
  Header/Footer/Réalisations (Sereno toujours 41px) intacts.

Un seul fichier modifié : `src/components/hero/HeroSpheres.tsx`. Rapport
détaillé : `docs/rapports/rapport_cs_s6c_ajustements_billes_metalliques.txt`.

### 5.1novies CS-S6B — Refonte du Hero 3D : trois billes métalliques

Statut : **GREEN techniquement, ajustée par CS-S6C**. Voir section
5.1decies pour les corrections apportées.

CS-S6 (sculpture géométrique abstraite) a été rejeté esthétiquement par
Sébastien ("objet noir qui ne raconte rien", "widget 3D dans une carte",
cadres CSS parasites visibles derrière). CS-S6B refond entièrement la
direction visuelle en conservant l'acquis technique :

- Nouveau concept : **3 sphères métalliques satinées** (graphite très
  sombre, `metalness 0.88 / roughness 0.38`, reflet Ember ponctuel via une
  seule pointLight) + **5 filaments de vent** en arrière-plan (courbes
  `CatmullRomCurve3` via `<Line>` de Drei, opacité 0.09-0.12, loin
  derrière les sphères). Nouveau fichier `src/components/hero/
  HeroSpheres.tsx`, remplace `HeroSculpture.tsx` (supprimé).
- Les cadres/lignes/blocs CSS de CS-S6 sont **supprimés** (pas masqués :
  retirés du DOM et du CSS) — réponse directe à la question de Sébastien
  "à quoi servent les cadres derrière ?". Il ne reste qu'un halo minimal
  en fallback.
- Le Canvas n'est plus un widget confiné dans une boîte du Hero : il
  devient un **fond fixe plein viewport** (`position:fixed; z-index:-1;
  pointer-events:none`), structurellement incapable de passer au-dessus
  du contenu ou d'intercepter un clic — vérifié empiriquement via
  `elementFromPoint` sur les CTA du Hero.
- **Comportement au scroll** : la scène démarre ancrée à droite (calculée
  en fraction de `state.viewport.width`, donc responsive sans logique par
  breakpoint), puis migre en douceur vers le centre sur la hauteur du
  Hero (`THREE.MathUtils.lerp`/`damp`, aucune dépendance ajoutée), devient
  un fond permanent une fois recentrée (occultée naturellement par les
  sections à fond opaque qui la recouvrent au scroll suivant). Une
  vitesse de scroll instantanée pilote une "énergie" (attaque rapide,
  relâchement doux via un damping asymétrique) qui amplifie temporairement
  l'orbite des sphères pendant un scroll actif, confirmé visuellement.
- `prefers-reduced-motion` conservé et adapté : sous cette préférence, le
  repositionnement scroll reste appliqué (utile, piloté par l'utilisateur)
  mais sans lissage animé et sans aucune sous-animation décorative — pose
  strictement stable, scène toujours visible (hash de capture identique
  confirmé).
- Mobile inchangé : `client:media="(min-width: 900px)"` conservé, aucun
  chunk 3D chargé sous 900px, vérifié.
- Aucune nouvelle dépendance, aucun GSAP, aucun GLB/Blender.

Rapport détaillé : `docs/rapports/rapport_cs_s6b_hero_billes_metalliques.txt`.
Prochaine étape : validation visuelle de Sébastien + ChatGPT.

### 5.1octies CS-S6 — Prototype Hero 3D (Sculptural Tech, primitives) — DIRECTION ABANDONNÉE, VOIR CS-S6B

Statut : **GREEN techniquement**. Verdict esthétique en attente de la
validation visuelle de Sébastien (+ ChatGPT en garde-fou).

Introduit pour la première fois la couche "Sculptural Tech" de la DA dans
la zone `.home-hero__stage` déjà réservée depuis CS-S3 : un objet 3D
abstrait ("assemblage modulaire en tension autour d'un vide central", 6
modules `RoundedBox` asymétriques, matériaux graphite + un seul accent
Ember, 3-4 lumières, aucune texture/HDR externe) construit avec Three.js /
React Three Fiber / Drei — dépendances déjà installées depuis CS-S0,
jamais utilisées jusqu'ici. Nouveaux fichiers : `src/components/hero/
HeroScene.tsx` (hydratation, IntersectionObserver, reduced-motion, Canvas)
et `HeroSculpture.tsx` (géométrie/matériaux/lumières/animation).

Hydratation retenue et **testée réellement, pas supposée** :
`client:media="(min-width: 900px)"` — fonctionne nativement avec cette
version de la stack (Astro 7.3.2 / R3F 9.7.0) : le SSR du `<Canvas>` ne
crashe pas, le chunk 3D n'est jamais demandé sous 900px (confirmé par
inspection réseau), un contexte WebGL réel est actif dès 900px. Le seuil
CSS de la stage (`.home-hero__stage`) a été aligné de 960px à 900px pour
coller exactement à ce seuil d'hydratation (auparavant une fenêtre
900-959px aurait hydraté un Canvas invisible). Coût bundle mesuré : ≈229 Ko
gzip (Three+R3F+Drei+composant), chargé uniquement ≥900px.

`prefers-reduced-motion` respecté (pose statique confirmée par comparaison
de captures, hash identique), mouvement ambiant très lent + réaction
pointeur desktop amplitude faible avec damping (mouvement réel confirmé,
hash différents). Fallback CSS pré-existant (glow/cadre/lignes) conservé
intact et vérifié présent dans le HTML statique indépendamment de toute
exécution React. Aucune nouvelle dépendance, aucun GSAP, aucun GLB/Blender,
aucun post-processing, aucun OrbitControls. Header/Footer/Réalisations
(dont le correctif CS-S5B) revérifiés intacts.

Rapport détaillé : `docs/rapports/rapport_cs_s6_hero_3d_prototype.txt`.
**Verdict Blender (CS-S7) en attente de validation humaine** : les
primitives se sont montrées suffisantes techniquement, mais la décision
esthétique (garder les primitives / passer à Blender / revoir le concept)
appartient à Sébastien + ChatGPT.

### 5.1septies CS-S5B — Correction visuelle Sereno (section Réalisations)

Statut : **GREEN**. Corrige le défaut esthétique signalé sur la carte flagship Sereno : un grand vide (mesuré ~431px à 1440px) séparait le haut de la carte de son média principal.

Cause identifiée par inspection du code et mesure navigateur (pas supposée) : `.home-projects__grid` étire par défaut (stretch Grid) la carte Sereno à la hauteur de la colonne secondaire (AgencyOS+Belkhir empilés), `.project-card` porte `height:100%` (règle de base partagée), et l'ancien `.project-card--featured { justify-content: flex-end; }` poussait tout le contenu flex — média compris — vers le bas de cette boîte artificiellement trop haute. Corrigé uniquement dans `.project-card--featured` (`align-self: start` + `height: auto`, retrait du `justify-content: flex-end`) : la règle de base `.project-card` et `home.css` ne sont pas modifiés, AgencyOS/Belkhir conservent leur traitement exact. Vide résiduel après correction : 41px à 1440px, correspondant au padding normal de la carte.

La section Réalisations est désormais techniquement validée. Verdict esthétique en attente de la validation visuelle de Sébastien. Rapport détaillé : `docs/rapports/rapport_cs_s5b_sereno_visual_fix.txt`.

Prochaine étape : **CS-S6 — Prototype Hero 3D**, en attente de validation humaine.

### 5.1sexies CS-S5 — Landing V1 polie, médias réels, copy commerciale

Statut : **GREEN techniquement** (12 septembre 2026). Verdict esthétique en attente de la validation visuelle de Sébastien.

La Home passe de copy V0 de wireframe à une **copy commerciale V1** (Hero, Expertises, Approche, Réalisations, Méthode — Capacités et CTA final déjà corrects, inchangés). SEO Home mis à jour (title/description).

Les 3 placeholders médias de la section Réalisations sont remplacés par les vrais médias fournis par Sébastien, via `astro:assets` (`<Picture>`, AVIF/WebP + fallback JPG, `loading="lazy"`, `decoding="async"`, aucun `fetchpriority="high"`) : Sereno (flagship, dashboard + inset facture), AgencyOS (standard, dashboard + inset factures), Belkhir Dépannage (standard, hero + inset urgences, explicitement décrit comme **maquette**). Mapping typé dans `src/data/projectMedia.ts`. Les champs `summary`/`seoDescription` de la Content Collection ont été réécrits honnêtement (aucun KPI, aucune métrique, aucun client inventé) ; `problem`/`solution`/`result` restent volontairement en placeholder (non consommés par la Home).

Bug de scoping CSS identique à celui de CS-S4B (Header) trouvé et corrigé dans `Footer.astro` (`.site-footer__inner` ne s'appliquait jamais, classe passée via `<Container>`) — correction limitée au scoping, aucune autre modification du Footer.

Header CS-S4B préservé sans régression (vérifié à 9 largeurs). Hero toujours sans média 3D. Aucune nouvelle dépendance, aucune 3D, aucun GSAP, aucun React island.

Prochaine étape : validation visuelle humaine, puis **CS-S6 — Prototype Hero 3D**.

### 5.1quinquies CS-S4B — Correction visuelle du Header

Statut : **GREEN techniquement** (12 septembre 2026). Corrige un défaut esthétique constaté par Sébastien sur le Header CS-S4 (pas de vraie barre horizontale, CTA visible sur mobile).

Cause réelle identifiée par inspection du HTML/CSS compilé (pas supposée) : en Astro, le CSS scopé d'un composant ne s'applique qu'aux éléments que CE composant écrit lui-même. `Header.astro` passait ses classes de layout (`site-header__inner`, `site-header__cta`) à des composants enfants (`Container`, `ActionLink`) — les éléments réellement rendus ne portaient donc pas l'attribut de scope de `Header.astro`, et les règles `display:flex`/`display:none` ne s'appliquaient jamais. Corrigé via des sélecteurs `:global()` (avec une spécificité égale ou supérieure à celle des règles internes d'`ActionLink`, vérifiée empiriquement).

Résultat : Header desktop en une seule ligne (grid `auto 1fr auto`, ~72px de haut), CTA discret (44px) toujours à droite ; Header mobile = marque + hamburger uniquement, CTA masqué (disponible dans le panneau mobile). Breakpoint unique 1100px (nav, CTA header et hamburger basculent ensemble, jamais d'état hybride) — vérifié à 1440/1280/1180/1100/1099/1024/900/768/390px via navigateur headless. Footer et Home non modifiés.

Prochaine étape : validation visuelle humaine, puis **CS-S5 — Landing statique complète**.

### 5.1quater CS-S4 — Composants réutilisables + Header/Footer premium

Statut : **GREEN techniquement** (12 septembre 2026). Verdict esthétique en attente de la validation visuelle de Sébastien.

Composants V1 créés sous `src/components/ui/` : `ActionLink`, `Container`, `SectionHeading`, `ServiceItem`, `ProjectCard` — extraits uniquement là où CS-S3 les justifiait réellement (pas d'abstraction théorique). La Home (`src/pages/index.astro`) a été refactorisée pour les utiliser : mêmes 7 sections, même ordre, même H1, même copy V0, mêmes 3 réalisations issues de la Content Collection — résultat visuel quasiment identique à CS-S3.

Header V1 (`src/components/layout/Header.astro`) : navigation desktop simplifiée (marque, Services regroupés dans un panneau accessible au clic/clavier, Réalisations, Méthode, À propos, CTA « Parler du projet » → `/contact/`), sticky, état actif via bordure discrète (jamais la couleur seule). `MobileNav.astro` : hamburger accessible (`aria-expanded`/`aria-controls`), panneau latéral, fermeture Escape/backdrop/clic lien, focus géré sans focus trap complexe — petit script vanilla, aucun React.

Footer V1 : 4 zones (marque, services, studio, mentions légales), aucune coordonnée inventée, aucun réseau social, aucun second CTA.

Aucune 3D, aucun GSAP, aucun React island, aucune nouvelle dépendance.

Prochaine étape : validation visuelle humaine, puis **CS-S5 — Landing statique complète**.

### 5.1ter CS-S3 — Wireframe premium de la Home

Statut : **GREEN techniquement** (12 septembre 2026). Verdict esthétique en attente de la validation visuelle de Sébastien.

La Home (`src/pages/index.astro`) a une vraie architecture en 7 sections dans l'ordre : Hero (H1, sous-texte, 2 CTA, zone `.home-hero__stage` réservant la place du futur objet 3D — statique, `aria-hidden`, aucun canvas/Three.js) → Expertises (3 offres) → Approche/différenciation (statement "la technologie s'adapte au projet") → Réalisations phares (3 projets tirés de la Content Collection `realisations`, triés featured puis order) → Méthode (5 étapes) → Capacités techniques (4 groupes sobres) → CTA final.

Toute la copy de cette Home est une **copy V0 de wireframe** : crédible et proche du futur message, mais pas la rédaction commerciale définitive. Aucune métrique, client ou témoignage inventé.

Styles isolés dans `src/styles/home.css` (classes préfixées `home-`, importé uniquement par `index.astro`) — `tokens.css`/`global.css` et Header/Footer n'ont pas été modifiés. Aucune 3D, aucun GSAP, aucun React island.

Prochaine étape : validation visuelle humaine, puis **CS-S4 — extraction des composants réutilisables**.

### 5.1bis CS-S2 / CS-S2B / CS-S2C — Design Foundations propagées

Statut : **GREEN** (12 septembre 2026). Verdict esthétique validé par Sébastien après revue du Design Lab (`docs/rapports/RAPPORT_CS_S2B_VALIDATION_VISUELLE.txt`), puis propagé au socle de production (CS-S2C).

Décisions définitives V1 :

- Typographie : **Sora Variable** (display, H1–H6) + **Manrope Variable** (body/UI), chargées globalement et auto-hébergées (Fontsource, aucune requête Google Fonts). Syne reste installée mais réservée au Design Lab.
- Palette : fond graphite `#0A0B0D` / `#0E1013`, surfaces `#121419` / `#171A20`, texte ivoire `#F1EFE8`, textes secondaires `#A5A8AE` / `#6D727B`, bordures très fines (`rgba(241,239,232,.08 / .16)`).
- Accent Ember de production : **`#E45F36`** (ajusté depuis le candidat `#F06432` après validation visuelle — plus cuivré, moins vif).
- Rayons : 10px et 16px dominants, 6px pour le détail, 22px exceptionnel.
- Liens ivoire au repos, accent Ember uniquement au survol/focus (l'accent reste rare).
- Header/Footer harmonisés par la cascade des tokens (fond `--color-bg-soft`, textes/liens ivoire) — aucune modification de leur structure, contenu ou liens.
- `/design-lab/` reste l'outil interne de comparaison (noindex, hors sitemap, hors navigation).
- Aucune 3D, aucun GSAP, aucun composant de production (Button/ServiceCard/ProjectCard) créés à ce stade — ce sprint ne construit que le socle visuel, pas la landing.

Prochaine étape : **CS-S3 — Wireframe / architecture de la landing.**

### 5.1 CS-S0 — Socle technique

Statut :

**GREEN**

Validation réalisée :

- Astro fonctionne ;
- TypeScript strict actif ;
- React intégré sans transformer le site en SPA ;
- Three.js / React Three Fiber / Drei installés ;
- GSAP installé ;
- aucune scène 3D active ;
- aucun ScrollTrigger actif ;
- sitemap généré ;
- CSS global et tokens temporaires en place ;
- 13 routes publiques + une page 404 générées ;
- 3 réalisations provenant d’une Content Collection ;
- SEO de base en place ;
- `npm run check` : 0 erreur, 0 warning, 0 hint ;
- `npm run build` : vert ;
- 14 pages générées.

### 5.2 CS-S1 — Documentation et structure de travail

Statut :

**GREEN**, après ajout du présent `CONTEXT.md` et du `README.md`.

Structure locale privée :

```text
docs/
├── prompts/
├── rapports/
├── brainstorm/
└── roadmap/
```

Le dossier `docs/` est volontairement ignoré par Git.

Il contient les artefacts de travail locaux :
- prompts Claude Code ;
- rapports d’exécution ;
- brainstorms ;
- roadmaps ;
- notes internes.

Ces fichiers ne doivent pas être versionnés par défaut.

---

## 6. Stack réellement présente

État issu de CS-S0.

| Élément | Version / choix actuel |
|---|---|
| Astro | `7.3.2` |
| TypeScript | `6.0.3` |
| React | `19.2.8` |
| React DOM | `19.2.8` |
| @astrojs/react | `6.0.5` |
| @astrojs/sitemap | `3.7.4` |
| Three.js | `0.186.0` |
| @react-three/fiber | `9.7.0` |
| @react-three/drei | `10.7.8` |
| GSAP | `3.15.0` |
| Styles | CSS natif + design tokens |
| Contenu | Astro Content Collections |
| Rendu | statique par défaut |
| Package manager | npm |

### 6.1 Décision React / R3F importante

React est volontairement épinglé en `19.2.8`.

Raison :

`@react-three/fiber@9.7.0` déclare actuellement un peer dependency compatible avec React `>=19 <19.3`.

Ne pas lancer un `npm update` global ou modifier cette version sans vérifier la compatibilité R3F.

### 6.2 Node

État observé lors de CS-S0 :

- Node `22.17.0` ;
- npm `10.9.2`.

Une dépendance transitive (`undici`) signale un moteur Node `>=22.19.0`.

Le projet compile et build correctement malgré ce warning.

Dette légère :
- mettre Node à jour vers une version compatible lorsque cela est pratique ;
- ne pas transformer ce point en chantier tant qu’il n’est pas bloquant.

---

## 7. Philosophie d’architecture

Le site doit rester essentiellement statique.

Architecture conceptuelle :

```text
ASTRO
│
├── HTML statique
│   ├── SEO
│   ├── contenus
│   ├── services
│   ├── réalisations
│   └── pages commerciales
│
├── CSS
│   ├── responsive
│   ├── design tokens
│   └── micro-interactions
│
└── Îlots interactifs
    │
    ├── React
    ├── Three.js / React Three Fiber
    └── GSAP / ScrollTrigger
```

Règles structurantes :

- React uniquement pour de vrais besoins interactifs ;
- aucune transformation du site en SPA ;
- aucune hydratation inutile ;
- la 3D est un progressive enhancement ;
- le contenu SEO essentiel doit toujours exister dans le DOM HTML ;
- aucune information importante ne doit exister uniquement dans un canvas WebGL ;
- GSAP ne doit pas être exécuté globalement sans nécessité ;
- la performance reste prioritaire.

---

## 8. Arborescence publique V1

Routes réellement créées :

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

Routes volontairement non créées en V1 :

- maintenance dédiée ;
- refonte dédiée ;
- blog ;
- ressources ;
- tarifs ;
- espace client ;
- pages technologies ;
- pages locales SEO ;
- CMS ;
- backend.

---

## 9. Réalisations V1

Collection :

`realisations`

Entrées initiales :

### Sereno

Catégorie de travail :

**Application métier / SaaS**

### AgencyOS

Catégorie de travail :

**Application métier / SaaS**

### Belkhir Dépannage

Catégorie de travail :

**Site professionnel**

Ces catégories sont cohérentes avec le positionnement actuel mais restent modifiables si le contenu commercial final impose un vocabulaire plus précis.

Chaque réalisation possède actuellement un schéma de données comprenant :

- slug ;
- title ;
- shortTitle optionnel ;
- summary ;
- category ;
- featured ;
- order ;
- technologies ;
- problem ;
- solution ;
- result ;
- seoTitle ;
- seoDescription.

Les textes marketing complets ne sont pas encore rédigés.

Ne jamais inventer de KPI, gains client, conversions, chiffre d’affaires ou résultat quantifié sans preuve.

---

## 10. Architecture de fichiers actuelle

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

`src/assets/` sera créé au premier besoin réel.

`src/components/ui/` sera créé uniquement lorsque des composants UI réutilisables réels existeront.

Ne pas créer des dossiers abstraits sans usage.

---

## 11. SEO

Socle existant :

- `lang="fr"` ;
- title unique par page ;
- meta description unique ;
- canonical ;
- Open Graph minimal ;
- sitemap ;
- robots.txt ;
- H1 unique ;
- structure HTML sémantique.

Le domaine actuel :

`https://cantrelle-studio.example`

est volontairement un placeholder `.example`.

Il doit être remplacé avant mise en ligne dans :
- `astro.config.mjs` ;
- `public/robots.txt`.

Ne pas ajouter de JSON-LD `Organization` tant que les données réelles ne sont pas connues :

- nom définitif ;
- statut juridique ;
- adresse ;
- SIRET ;
- téléphone ;
- domaine réel.

Aucune donnée d’entreprise ne doit être inventée pour remplir un schema SEO.

---

## 12. Accessibilité

Socle déjà présent :

- `lang="fr"` ;
- structure sémantique ;
- lien d’évitement ;
- focus visible ;
- navigation clavier native ;
- H1 unique ;
- `prefers-reduced-motion` ;
- aucun mouvement automatique actuellement.

Règles pour les prochains sprints :

- ne jamais transmettre une information uniquement par couleur ;
- conserver les focus visibles ;
- maintenir un ordre de tabulation logique ;
- tester desktop, tablette et mobile ;
- toute animation doit avoir un fallback ou une expérience correcte sans mouvement.

---

## 13. Direction artistique

**Statut : VALIDÉE et propagée au socle de production (CS-S2 → CS-S2B → CS-S2C, 12 septembre 2026).** Voir section 5.1bis pour le détail des tokens définitifs et `src/styles/tokens.css` pour la source de vérité technique.

Mix retenu : 60 % Precision Dark + 25 % Editorial Engineering + 15 % Sculptural Tech (Sculptural Tech reste sans 3D pour l'instant).

Formulation de travail :

> **Ingénierie numérique premium : claire, précise, profonde.**

Mots-clés :

- précis ;
- contemporain ;
- profond ;
- élégant ;
- humain ;
- légèrement futuriste ;
- rassurant ;
- jamais cyberpunk ;
- jamais agence marketing criarde ;
- jamais portfolio de développeur cliché.

Ce qui reste ouvert (non traité par CS-S2C) : Hero final, landing, composants de production (Button/Card réutilisables), 3D. La palette et la typographie, elles, sont désormais des décisions figées V1, pas des candidats.

---

## 14. Hero et 3D

La 3D n’est pas encore implémentée.

Concept de travail :

représenter visuellement un système numérique modulaire pouvant évoquer :

- Web ;
- Application ;
- API ;
- Data ;
- SaaS ;
- Infrastructure.

Idée de narration :

> les bonnes briques assemblées autour du besoin.

Règles :

- ne pas commencer Blender avant validation du Hero statique et du prototype 3D ;
- prototyper d’abord avec des primitives R3F ;
- limiter la charge mobile ;
- prévoir un fallback ;
- respecter `prefers-reduced-motion` ;
- ne jamais sacrifier les Core Web Vitals pour une démonstration visuelle.

---

## 15. Workflow de projet

### Sébastien

Rôle :
- autorité produit ;
- décisions finales ;
- validation visuelle ;
- validation des contenus ;
- validation des actions Git.

### ChatGPT

Rôle :
- pilote les micro-sprints ;
- protège le périmètre ;
- prépare les prompts Claude Code ;
- challenge les choix ;
- maintient la cohérence globale ;
- exige les preuves avant de déclarer un sprint vert.

### Claude

Rôle :
- brainstorming ponctuel ;
- challenge du positionnement, naming ou concepts ;
- pas d’exécution principale du projet.

### Claude Code

Rôle :
- exécution locale ;
- lecture du code ;
- implémentation bornée ;
- validations ;
- rapport exhaustif ;
- aucune extension spontanée du scope.

---

## 16. Règles Git

Un assistant ne doit jamais effectuer sans autorisation explicite :

- `git add` ;
- `git commit` ;
- `git push` ;
- `git merge` ;
- `git rebase` ;
- changement de branche ;
- suppression de branche ;
- création de PR.

Les prompts et rapports sous `docs/` restent locaux.

Ils sont ignorés via `.gitignore`.

Avant une publication Git, Sébastien et ChatGPT relisent :
- le diff ;
- les validations ;
- le rapport ;
- les fichiers touchés ;
- les éventuels warnings.

---

## 17. Conventions de développement

- TypeScript strict ;
- Astro comme socle principal ;
- React seulement si nécessaire ;
- CSS natif et design tokens ;
- pas de Tailwind sans décision explicite ;
- pas de nouvelle dépendance sans besoin établi ;
- pas de bibliothèque UI lourde par défaut ;
- composants simples et réutilisables ;
- pas d’abstraction prématurée ;
- HTML sémantique ;
- SEO réel dans le DOM ;
- contenu client avant jargon technique ;
- mobile pensé dès le composant ;
- performance mesurée ;
- aucun contenu fictif présenté comme réel ;
- aucune métrique inventée.

---

## 18. Pièges connus

- ne pas transformer Cantrelle Studio en portfolio recruteur ;
- ne pas mettre une liste de technologies dans le Hero comme promesse principale ;
- ne pas choisir les polices ou couleurs sans cohérence de marque ;
- ne pas commencer Blender trop tôt ;
- ne pas construire la 3D avant la landing statique ;
- ne pas hydrater React sans nécessité ;
- ne pas utiliser GSAP pour de simples transitions CSS ;
- ne pas remplacer le HTML par du canvas ;
- ne pas créer 20 composants UI avant qu’ils soient réellement nécessaires ;
- ne pas faire un `npm update` aveugle à cause de la compatibilité React/R3F ;
- ne pas oublier de remplacer le domaine `.example` avant publication ;
- ne pas inventer les données légales de l’entreprise ;
- ne pas versionner `docs/` ;
- ne pas absorber plusieurs sprints dans une seule mission Claude Code.

---

## 19. Roadmap de travail

### CS-S0 — Socle technique

**GREEN**

### CS-S1 — Documentation / sources de vérité

**GREEN**

Livrables :
- structure locale `docs/` ;
- `CONTEXT.md` ;
- `README.md`.

### CS-S2 / CS-S2B / CS-S2C — Direction artistique / Design Foundations

**GREEN.** Voir section 5.1bis.

### CS-S3 — Wireframe landing

**GREEN techniquement, verdict esthétique en attente.** Voir section 5.1ter.

### CS-S4 — Composants réutilisables

**GREEN techniquement, verdict esthétique en attente.** Voir section 5.1quater.

### CS-S5 — Landing statique complète

**GREEN techniquement, verdict esthétique en attente.** Voir section 5.1sexies.

### CS-S5B — Correction visuelle Sereno

**GREEN.** Voir section 5.1septies.

### CS-S6 — Prototype Hero 3D (sculpture) — direction abandonnée

**GREEN techniquement mais direction visuelle abandonnée sur verdict humain.** Voir section 5.1octies. Remplacé par CS-S6B.

### CS-S6B — Refonte Hero 3D : trois billes métalliques

**GREEN techniquement, ajustée par CS-S6C.** Voir section 5.1novies.

### CS-S6C — Ajustements ciblés (matière, reflets, vitesse, gravité)

**GREEN techniquement, mouvement remplacé par CS-S6D.** Voir section 5.1decies.

### CS-S6D — Direction orbitale symbolique + lumières renforcées

**GREEN techniquement, mouvement du centre ajusté par CS-S6E.** Voir section 5.1undecies.

### CS-S6E — Ellipse propre du "soleil"

**GREEN techniquement, distance Terre/Soleil et orbite de la Lune ajustées par CS-S6F.** Voir section 5.1duodecies.

### CS-S6F — Terre reculée + orbite inclinée de la Lune

**GREEN techniquement, verdict visuel en attente.** Voir section 5.1terdecies.

### CS-S7 — Assets Blender si nécessaires

À décider après validation humaine de CS-S6F.

### CS-S8 — Motion system & profondeur globale (Home)

**GREEN techniquement, verdict esthétique en attente.** Voir section 5.0.

### CS-S8A — Fix dev + replay reveals + restauration médias

**GREEN techniquement, verdict esthétique en attente.** Voir section 5.0bis.

### CS-S8B — Surfaces & composants premium

**GREEN techniquement, verdict esthétique en attente.** Voir section 5.0ter.

### CS-S9 — Pages services : 3 landings SEO / commerciales

**GREEN techniquement, verdict esthétique et commercial en attente.** Voir section 5.0quater.

### CS-S9B — Pages services premium + médias + motion léger

**GREEN techniquement, verdict esthétique et commercial en attente.** Voir section 5.0quinquies.

### CS-S10 — Études de cas premium : Sereno / AgencyOS / Belkhir

**GREEN techniquement, verdict esthétique et narratif en attente.** Voir section 5.0sexies.

### CS-S10B — Connexions Services ↔ Études de cas

**GREEN techniquement, verdict UX/commercial en attente.** Voir section 5.0septies.

---

## 20. Checklist d’onboarding rapide

Avant de proposer du code :

- [ ] lire ce fichier ;
- [ ] lire `README.md` ;
- [ ] identifier le sprint actif ;
- [ ] inspecter les fichiers concernés ;
- [ ] vérifier que le scope est borné ;
- [ ] vérifier les dépendances avant d’en ajouter ;
- [ ] préserver le SEO statique ;
- [ ] préserver l’accessibilité ;
- [ ] préserver la performance ;
- [ ] ne pas élargir le périmètre.

Avant de remettre un sprint :

- [ ] `npm run check` vert ;
- [ ] `npm run build` vert ;
- [ ] diff limité au périmètre ;
- [ ] pas de warning nouveau non documenté ;
- [ ] pas de fichier `docs/` versionné ;
- [ ] rapport exhaustif produit ;
- [ ] aucun commit/push sans accord ;
- [ ] verdict honnête : GREEN / AMBER / RED.

---

## 21. Vision à moyen terme

Cantrelle Studio doit devenir :

- un site commercial réellement orienté client ;
- une preuve de maîtrise SEO ;
- une preuve de maîtrise frontend ;
- une preuve de maîtrise de la 3D web ;
- une vitrine de la capacité à comprendre un métier ;
- une porte d’entrée vers les projets SaaS et applications métier ;
- une marque capable de grandir au-delà d’une seule personne.

Le site lui-même doit devenir une étude de cas.

---

## 22. Maintenance de ce document

Mettre à jour `CONTEXT.md` lorsqu’un changement touche :

- le positionnement ;
- le nom de marque ;
- une technologie structurante ;
- la stack ;
- l’arborescence ;
- le workflow ;
- la direction artistique globale ;
- les règles SEO ;
- la stratégie 3D ;
- la politique Git ;
- le statut d’un sprint majeur.

Ne pas le modifier pour chaque détail local.

Lors de chaque révision significative, noter :
- la date ;
- le sprint de référence ;
- le nouvel état validé.
