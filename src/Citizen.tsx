
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type CitizenProps = {
  color: string;
  offset: number;
  speed: number;
  lane: "horizontal" | "vertical";
  position: number;
};

function Citizen({
  color,
  offset,
  speed,
  lane,
  position,
}: CitizenProps) {
  const character = useRef<Group>(null);
  const legs = useRef<Group>(null);
  const arms = useRef<Group>(null);

  useFrame((state) => {
    if (!character.current) return;

    const phase = (state.clock.elapsedTime * speed + offset) % 2;
    const progress = phase <= 1 ? phase : 2 - phase;
    const direction = phase <= 1 ? 1 : -1;

    const distance = -18 + progress * 36;

    if (lane === "horizontal") {
      character.current.position.set(distance, 0, position);
      character.current.rotation.y =
        direction > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      character.current.position.set(position, 0, distance);
      character.current.rotation.y =
        direction > 0 ? 0 : Math.PI;
    }

    const walking = Math.sin(state.clock.elapsedTime * speed * 8);

    if (legs.current) {
      legs.current.rotation.x = walking * 0.45;
    }

    if (arms.current) {
      arms.current.rotation.x = -walking * 0.3;
    }
  });

  return (
    <group ref={character}>
      {/* Kepala */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#f0bd91" />
      </mesh>

      {/* Rambut */}
      <mesh position={[0, 1.65, -0.03]} castShadow>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshStandardMaterial color="#382b25" />
      </mesh>

      {/* Badan */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.45, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Lengan */}
      <group ref={arms} position={[0, 1.12, 0]}>
        <mesh position={[-0.28, -0.12, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.55, 8]} />
          <meshStandardMaterial color="#f0bd91" />
        </mesh>

        <mesh position={[0.28, -0.12, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.55, 8]} />
          <meshStandardMaterial color="#f0bd91" />
        </mesh>
      </group>

      {/* Kaki */}
      <group ref={legs} position={[0, 0.55, 0]}>
        <mesh position={[-0.12, -0.27, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.55, 8]} />
          <meshStandardMaterial color="#303b50" />
        </mesh>

        <mesh position={[0.12, -0.27, 0]}>
          <cylinderGeometry args={[0.08, 0.07, 0.55, 8]} />
          <meshStandardMaterial color="#303b50" />
        </mesh>
      </group>
    </group>
  );
}

export default function CitizenSystem() {
  const citizens = [
    { color: "#e76f51", lane: "horizontal" as const, position: -0.9 },
    { color: "#457b9d", lane: "horizontal" as const, position: 0.9 },
    { color: "#e9c46a", lane: "horizontal" as const, position: -0.9 },
    { color: "#6a994e", lane: "horizontal" as const, position: 0.9 },
    { color: "#9b5de5", lane: "horizontal" as const, position: -0.9 },
    { color: "#f28482", lane: "horizontal" as const, position: 0.9 },

    { color: "#457b9d", lane: "vertical" as const, position: -0.9 },
    { color: "#e76f51", lane: "vertical" as const, position: 0.9 },
    { color: "#6a994e", lane: "vertical" as const, position: -0.9 },
    { color: "#e9c46a", lane: "vertical" as const, position: 0.9 },
    { color: "#9b5de5", lane: "vertical" as const, position: -0.9 },
    { color: "#f28482", lane: "vertical" as const, position: 0.9 },
  ];

  return (
    <>
      {citizens.map((citizen, index) => (
        <Citizen
          key={index}
          color={citizen.color}
          lane={citizen.lane}
          position={citizen.position}
          offset={index * 0.32}
          speed={0.35 + (index % 3) * 0.08}
        />
      ))}
    </>
  );
}
