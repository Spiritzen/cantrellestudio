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
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import heroEnvironmentSource from "../../assets/hdr/hdr.png";

export default function HeroEnvironmentImage() {
  const { gl, scene } = useThree();
  const pmremRef = useRef<THREE.PMREMGenerator | null>(null);

  useEffect(() => {
    let disposed = false;
    let renderTarget: THREE.WebGLRenderTarget | null = null;
    const previousEnvironment = scene.environment;

    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    pmremRef.current = pmremGenerator;

    const loader = new THREE.TextureLoader();
    loader.load(heroEnvironmentSource.src, (texture) => {
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
    });

    return () => {
      disposed = true;
      scene.environment = previousEnvironment;
      renderTarget?.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
}
