
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, MathUtils, Group } from "three";

export type MoveInput = {
  x: number;
  y: number;
};

export type LookInput = {
  yaw: number;
  pitch: number;
};

type PlayerProps = {
  move: MoveInput;
  look: LookInput;
};

export default function Player({ move, look }: PlayerProps) {
  const player = useRef<Group>(null);
  const { camera } = useThree();

  const position = useRef(new Vector3(0, 0, 0));
  const cameraPosition = useRef(new Vector3());

  useFrame((_, delta) => {
    if (!player.current) return;

    const speed = 5;
    const forward = -move.y;
    const right = move.x;

    // Gerakan berdasarkan arah kamera
    const dx =
      right * Math.cos(look.yaw) +
      forward * Math.sin(look.yaw);

    const dz =
      right * Math.sin(look.yaw) -
      forward * Math.cos(look.yaw);

    const length = Math.sqrt(dx * dx + dz * dz);
    const normalizedX = length > 1 ? dx / length : dx;
    const normalizedZ = length > 1 ? dz / length : dz;

    position.current.x += normalizedX * speed * delta;
    position.current.z += normalizedZ * speed * delta;

    // Batas sementara area kota
    position.current.x = MathUtils.clamp(position.current.x, -20, 20);
    position.current.z = MathUtils.clamp(position.current.z, -20, 20);

    player.current.position.copy(position.current);

    // Karakter menghadap arah gerakan
    if (length > 0.08) {
      player.current.rotation.y = Math.atan2(normalizedX, normalizedZ);
    }

    // Kamera mengikuti karakter dari belakang
    const distance = 6;
    const height = 2.5 + look.pitch * 3;

    cameraPosition.current.set(
      position.current.x + Math.sin(look.yaw) * distance,
      position.current.y + height,
      position.current.z + Math.cos(look.yaw) * distance
    );

    camera.position.lerp(
      cameraPosition.current,
      1 - Math.exp(-5 * delta)
    );

    camera.lookAt(
      position.current.x,
      position.current.y + 1.1,
      position.current.z
    );
  });

  return (
    <group ref={player} position={[0, 0, 0]}>
      {/* Kepala */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.23, 16, 12]} />
        <meshStandardMaterial color="#f0bd91" />
      </mesh>

      {/* Rambut */}
      <mesh position={[0, 1.78, -0.04]} castShadow>
        <sphereGeometry args={[0.23, 12, 8]} />
        <meshStandardMaterial color="#382b25" />
      </mesh>

      {/* Badan */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.55, 4, 10]} />
        <meshStandardMaterial color="#3978bd" />
      </mesh>

      {/* Lengan kiri */}
      <mesh position={[-0.32, 1.08, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.09, 0.42, 4, 8]} />
        <meshStandardMaterial color="#f0bd91" />
      </mesh>

      {/* Lengan kanan */}
      <mesh position={[0.32, 1.08, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.09, 0.42, 4, 8]} />
        <meshStandardMaterial color="#f0bd91" />
      </mesh>

      {/* Kaki kiri */}
      <mesh position={[-0.13, 0.38, 0]}>
        <capsuleGeometry args={[0.1, 0.48, 4, 8]} />
        <meshStandardMaterial color="#303b50" />
      </mesh>

      {/* Kaki kanan */}
      <mesh position={[0.13, 0.38, 0]}>
        <capsuleGeometry args={[0.1, 0.48, 4, 8]} />
        <meshStandardMaterial color="#303b50" />
      </mesh>
    </group>
  );
}
