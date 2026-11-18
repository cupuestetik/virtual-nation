import type { AssetDefinition } from '../../types/asset';

interface ProceduralBuildingProps {
  definition: AssetDefinition;
  isGhost?: boolean;
}

export function ProceduralBuilding({ definition, isGhost = false }: ProceduralBuildingProps) {
  const { width, height, depth } = definition.dimensions;
  const color = definition.defaultColor;

  const isMosque = definition.id === 'bld_mosque';
  const isPalace = definition.id === 'bld_palace';
  const isHospital = definition.id === 'bld_hospital';
  const isHouse = definition.id === 'bld_house_1' || definition.id === 'bld_house_2';

  const opacity = isGhost ? 0.6 : 1;
  const transparent = isGhost;

  return (
    <group>
      {/* Pondasi */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.5, 0.3, depth + 0.5]} />
        <meshStandardMaterial
          color="#aaa69b"
          opacity={opacity}
          transparent={transparent}
        />
      </mesh>

      {/* Badan Bangunan */}
      <mesh position={[0, height / 2 + 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          roughness={0.75}
          opacity={opacity}
          transparent={transparent}
        />
      </mesh>

      {/* Atap Utama */}
      <mesh position={[0, height + 0.4, 0]} castShadow>
        <boxGeometry args={[width + 0.2, 0.25, depth + 0.2]} />
        <meshStandardMaterial
          color={isMosque ? '#328d70' : isPalace ? '#b99b58' : '#555d68'}
          opacity={opacity}
          transparent={transparent}
        />
      </mesh>

      {/* Ornamen Masjid: Kubah & Menara */}
      {isMosque && (
        <>
          <mesh position={[0, height + 1.15, 0]} castShadow>
            <sphereGeometry args={[0.9, 24, 16]} />
            <meshStandardMaterial
              color="#328d70"
              roughness={0.4}
              opacity={opacity}
              transparent={transparent}
            />
          </mesh>
          <mesh position={[0, height + 2.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.65, 8]} />
            <meshStandardMaterial
              color="#d5b45b"
              metalness={0.6}
              opacity={opacity}
              transparent={transparent}
            />
          </mesh>
          <group position={[width / 2 - 0.1, 0, depth / 2 - 0.1]}>
            <mesh position={[0, 2.2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 4.2, 8]} />
              <meshStandardMaterial
                color="#e8dfc8"
                opacity={opacity}
                transparent={transparent}
              />
            </mesh>
            <mesh position={[0, 4.5, 0]}>
              <coneGeometry args={[0.35, 0.8, 8]} />
              <meshStandardMaterial
                color="#328d70"
                opacity={opacity}
                transparent={transparent}
              />
            </mesh>
          </group>
        </>
      )}

      {/* Ornamen Istana: Pilar-pilar megah */}
      {isPalace && (
        <>
          {[-1.3, -0.45, 0.45, 1.3].map((x) => (
            <mesh key={x} position={[x, 1.45, depth / 2 + 0.06]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 2.3, 10]} />
              <meshStandardMaterial
                color="#f5f0e5"
                opacity={opacity}
                transparent={transparent}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Simbol Rumah Sakit: Palang Merah 3D */}
      {isHospital && (
        <group position={[0, height + 0.75, depth / 2 + 0.03]}>
          <mesh>
            <boxGeometry args={[0.85, 0.22, 0.12]} />
            <meshStandardMaterial
              color="#d84b4b"
              opacity={opacity}
              transparent={transparent}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.22, 0.85, 0.12]} />
            <meshStandardMaterial
              color="#d84b4b"
              opacity={opacity}
              transparent={transparent}
            />
          </mesh>
        </group>
      )}

      {/* Atap Limas untuk Rumah Warga */}
      {isHouse && (
        <mesh position={[0, height + 0.95, 0]} castShadow>
          <coneGeometry args={[width * 0.8, 1.4, 4]} />
          <meshStandardMaterial
            color="#9b5740"
            opacity={opacity}
            transparent={transparent}
          />
        </mesh>
      )}

      {/* Pintu Depan */}
      <mesh position={[0, 0.85, depth / 2 + 0.015]}>
        <boxGeometry args={[0.65, 1.4, 0.08]} />
        <meshStandardMaterial
          color="#654b38"
          opacity={opacity}
          transparent={transparent}
        />
      </mesh>

      {/* Jendela Sisi Kiri & Kanan */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, height * 0.65, depth / 2 + 0.02]}>
          <boxGeometry args={[0.5, 0.65, 0.08]} />
          <meshStandardMaterial
            color="#83b9ce"
            metalness={0.25}
            roughness={0.3}
            opacity={opacity}
            transparent={transparent}
          />
        </mesh>
      ))}
    </group>
  );
}
