// useHeroBallModel — extraction geometry/material UNIQUES de BALL.glb,
// voir PROMPT_CLAUDE_CODE_BALL_GLB_3_CORPS_TAILLES_ORIGINALES.txt.
// Remplace HeroBallGlb.tsx (test A/B à 1 sphère, voir
// PROMPT_CLAUDE_CODE_TEST_BALL_GLB_HERO.txt) désormais superflu : les 3
// corps du Hero utilisent ce hook.
//
// BALL.glb ne contient qu'un seul node/mesh ("Cube") et un seul matériau
// PBR ("Material.001", vérifié dans le JSON du .glb — metalness ≈0.94,
// roughness 0). Structure assez simple pour la solution la plus légère
// suggérée par le prompt : PAS de scene.clone()/<Clone> — extraire UNE
// SEULE FOIS la geometry et le material (useGLTF met déjà en cache le
// chargement/parsing par URL : un seul fetch réseau quel que soit le
// nombre d'appels de ce hook) puis les RÉUTILISER PAR RÉFÉRENCE sur
// plusieurs <mesh> JSX distincts dans HeroSpheres.tsx — autant d'Object3D
// différents (donc pas de conflit de parent unique) partageant la même
// geometry/le même material (aucune duplication de buffers GPU ni de
// texture).
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import ballGlbUrl from "../../assets/3d/BALL.glb?url";

export function useHeroBallModel() {
  const { scene } = useGLTF(ballGlbUrl);

  return useMemo(() => {
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.Material | THREE.Material[] | null = null;

    scene.traverse((child) => {
      if (geometry) return; // un seul mesh dans ce GLB, mais robuste si ça change un jour
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        geometry = mesh.geometry;
        material = mesh.material;
      }
    });

    if (!geometry || !material) {
      throw new Error("useHeroBallModel: aucun mesh trouvé dans BALL.glb");
    }
    // Casts explicites : geometry/material sont assignés dans la closure
    // de scene.traverse ci-dessus, le contrôle de flux de TS ne les
    // renarrowe pas au-delà du bloc — la garde runtime juste au-dessus
    // suffit à garantir leur présence ici.
    const foundGeometry = geometry as THREE.BufferGeometry;
    const foundMaterial = material as THREE.Material | THREE.Material[];

    // Bounding sphere du mesh BRUT (avant toute mise à l'échelle) —
    // calculée une seule fois par scène chargée (deps = [scene], jamais
    // par frame). Convertit les anciens rayons validés (LARGE/MEDIUM/
    // SMALL_RADIUS, HeroSpheres.tsx) en scale à appliquer par sphère.
    foundGeometry.computeBoundingSphere();
    const rawRadius =
      foundGeometry.boundingSphere && foundGeometry.boundingSphere.radius > 0 ? foundGeometry.boundingSphere.radius : 1;

    return { geometry: foundGeometry, material: foundMaterial, rawRadius };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);
}
