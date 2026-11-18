import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import { Vector3, MathUtils } from 'three';
import type { MapControls as MapControlsImpl } from 'three-stdlib';

export function BuildCamera() {
  const controlsRef = useRef<MapControlsImpl>(null);
  const { camera } = useThree();
  const isInitialized = useRef(false);

  // Posisi awal kamera isometrik saat beralih ke Build Mode
  const targetLookAt = useRef(new Vector3(0, 0, 0));
  const buildCamPos = useRef(new Vector3(0, 22, 24));

  useEffect(() => {
    isInitialized.current = false;
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Transisi halus saat pertama kali masuk ke Build Mode
    if (!isInitialized.current) {
      camera.position.lerp(buildCamPos.current, 1 - Math.exp(-6 * delta));
      controlsRef.current.target.lerp(targetLookAt.current, 1 - Math.exp(-6 * delta));
      controlsRef.current.update();

      if (camera.position.distanceTo(buildCamPos.current) < 0.2) {
        isInitialized.current = true;
      }
    }

    // Batasan wilayah (Bounding limits) agar kamera tidak melenceng terlalu jauh dari area kota 46x46
    const target = controlsRef.current.target;
    target.x = MathUtils.clamp(target.x, -20, 20);
    target.z = MathUtils.clamp(target.z, -20, 20);
    target.y = 0; // Kunci target selalu di permukaan tanah

    // Batasan posisi kamera
    camera.position.x = MathUtils.clamp(camera.position.x, -35, 35);
    camera.position.z = MathUtils.clamp(camera.position.z, -35, 35);
    camera.position.y = MathUtils.clamp(camera.position.y, 6, 45);
  });

  return (
    <MapControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={8}
      maxDistance={42}
      minPolarAngle={Math.PI / 6} // Sudut minimal ~30 derajat (miring atas)
      maxPolarAngle={Math.PI / 2.2} // Sudut maksimal ~81 derajat (mencegah kamera tembus tanah)
      screenSpacePanning={false} // Panning terjadi pada bidang X-Z tanah
    />
  );
}

export default BuildCamera;
