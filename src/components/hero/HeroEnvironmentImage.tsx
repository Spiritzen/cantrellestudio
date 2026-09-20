// HeroEnvironmentImage — bloc de TEST RÉVERSIBLE, voir
// PROMPT_CLAUDE_CODE_TEST_ENV_MAP_PNG_HERO.txt à la racine du repo.
//
// Objectif unique : charger `src/assets/hdr/hdr.png` (panorama
// équirectangulaire LDR — PAS un vrai .hdr/.exr grande plage dynamique) et
// l'appliquer comme `scene.environment` de la scène Hero EXISTANTE
// (HeroSpheres.tsx), pour observer son influence sur les réflexions des
// 3 sphères MeshStandardMaterial déjà en place. Ne remplace ni les
// lumières, ni les matériaux, ni les animations — voir HeroSpheres.tsx.
//
// Pourquoi pas <Environment files={...}> de drei (déjà utilisé plus haut
// dans HeroSpheres pour le rig Lightformer) : vérifié dans
// node_modules/@react-three/drei/core/useEnvironment.js (v10.7.8) — le
// sniffing d'extension de `useEnvironment` ne reconnaît que
// hdr/exr/jpg/jpeg/webp/cube, PAS png (`getLoader` renvoie null et
// l'appel lève une erreur). D'où la solution manuelle ci-dessous
// (TextureLoader + PMREMGenerator), conforme à l'approche 2 proposée par
// le prompt de test.
//
// Chargement IMPÉRATIF (TextureLoader.load, pas useLoader/Suspense) :
// évite qu'un <Suspense> de Canvas fasse disparaître tout le reste de la
// scène (sphères, filaments) pendant le téléchargement du PNG (~11 Mo).
// Un seul chargement réseau au montage (deps figées), un seul bake PMREM,
// aucune regénération par frame, nettoyage complet au démontage (mémoire).
//
// scene.environment SEULEMENT — jamais scene.background (§4 du prompt de
// test) : le panorama ne doit jamais être visible derrière le Hero,
// uniquement influencer les reflets/l'éclairage environnemental.
//
// RETRAIT DE CE TEST : supprimer <HeroEnvironmentImage /> dans
// HeroSpheres.tsx, dé-commenter le rig <Environment>/<Lightformer>
// d'origine juste au-dessus, puis supprimer ce fichier.
//
// Micro-sprint "sphères prêtes avant affichage" — `scene.environment` est
// assigné de façon ASYNCHRONE (callback de `TextureLoader.load`, jamais
// gated par le Suspense de `<Canvas>` — voir le commentaire "Chargement
// IMPÉRATIF" ci-dessus, INCHANGÉ). Les 3 sphères (BALL.glb, metalness
// ≈0.94/roughness 0, AUCUNE texture propre — vérifié dans le JSON du GLB)
// rendent leurs reflets EXCLUSIVEMENT via cet environnement : tant qu'il
// n'est pas assigné, un métal quasi-miroir sans IBL ne reçoit que les 3
// lumières directes de HeroSpheres.tsx (dont un `pointLight` Ember/orange
// proche et intense) — d'où le flash "marron" constaté par Sébastien,
// confirmé être un artefact d'ÉCLAIRAGE et non une couleur de matériau
// (baseColorFactor du GLB = gris neutre [0.8,0.8,0.8], vérifié). `onReady`
// est le SEUL signal fiable que HeroSpheres.tsx peut observer pour savoir
// que les reflets finaux sont disponibles (ce composant ne rend rien et ne
// passe `scene.environment` par aucun state/prop React).
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import heroEnvironmentSource from "../../assets/hdr/hdr.webp";

interface HeroEnvironmentImageProps {
  /** Invoqué UNE FOIS, dès que `scene.environment` est réellement assigné
   * (succès) OU en cas d'échec de chargement (repli contrôlé — prompt §2 :
   * "jamais écran bloqué sans explication en dev" — la composition est
   * alors révélée sans reflets HDR plutôt que jamais). Doit être une
   * référence STABLE côté appelant (`useCallback`, deps `[]`) : ce composant
   * la place en dépendance de son effet de chargement, et une référence qui
   * change à chaque rendu du parent relancerait le téléchargement/le bake
   * PMREM à chaque fois (prompt §5 : "aucun téléchargement en double"). */
  onReady?: () => void;
}

export default function HeroEnvironmentImage({ onReady }: HeroEnvironmentImageProps) {
  const { gl, scene, invalidate } = useThree();
  const pmremRef = useRef<THREE.PMREMGenerator | null>(null);

  useEffect(() => {
    let disposed = false;
    let renderTarget: THREE.WebGLRenderTarget | null = null;
    const previousEnvironment = scene.environment;

    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    pmremRef.current = pmremGenerator;

    const loader = new THREE.TextureLoader();
    loader.load(
      heroEnvironmentSource.src,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        renderTarget = pmremGenerator.fromEquirectangular(texture);
        scene.environment = renderTarget.texture;

        // La texture équirectangulaire source n'est plus nécessaire une fois
        // préfiltrée en PMREM : seul renderTarget.texture sert d'environnement.
        texture.dispose();
        onReady?.();
        // frameloop="demand" (reduced-motion, HeroScene.tsx) : ce chargement
        // async ne passe par aucun state/prop React que le reconciler R3F
        // observerait pour replanifier une frame — sans cet appel explicite,
        // la révélation des sphères (HeroSpheres.tsx) resterait en attente
        // indéfiniment sous ce mode (prompt §2 : "éviter tout deadlock...
        // ni attendre un événement impossible lorsque frameloop=demand").
        invalidate();
      },
      undefined,
      (error) => {
        if (disposed) return;
        console.error("HeroEnvironmentImage : échec du chargement de l'environnement HDR", error);
        onReady?.();
        invalidate();
      },
    );

    return () => {
      disposed = true;
      scene.environment = previousEnvironment;
      renderTarget?.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene, invalidate, onReady]);

  return null;
}
