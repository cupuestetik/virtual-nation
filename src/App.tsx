
import Player, { type MoveInput, type LookInput } from "./Player";
import MobileControls from "./MobileControls";
import CitizenSystem from "./Citizen";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import "./style.css";

type BuildingData = {
  id: number;
  name: string;
  type: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  description: string;
};

const buildings: BuildingData[] = [
  {
    id: 1, name: "Istana Presiden", type: "Istana Kepresidenan",
    x: -7, z: -7, width: 4, depth: 3.5, height: 3.2,
    color: "#e8dfc8", description: "Pusat kediaman dan kegiatan resmi Presiden."
  },
  {
    id: 2, name: "Gedung Pemerintahan", type: "Kantor Pemerintah",
    x: 7, z: -7, width: 3.5, depth: 3, height: 5,
    color: "#9eb8c7", description: "Tempat penyelenggaraan administrasi pemerintahan."
  },
  {
    id: 3, name: "Masjid Raya", type: "Tempat Ibadah",
    x: -7, z: 7, width: 4, depth: 4, height: 2.8,
    color: "#eee9dc", description: "Pusat kegiatan ibadah masyarakat."
  },
  {
    id: 4, name: "Rumah Sakit Nasional", type: "Fasilitas Kesehatan",
    x: 7, z: 7, width: 4, depth: 3.5, height: 4,
    color: "#e9e9e9", description: "Fasilitas pelayanan kesehatan masyarakat."
  },
  {
    id: 5, name: "Pasar Nusantara", type: "Pusat Perdagangan",
    x: -13, z: 0, width: 3.5, depth: 3, height: 2.5,
    color: "#d9a76c", description: "Pusat kegiatan jual beli dan perdagangan."
  },
  {
    id: 6, name: "Gedung Perkantoran", type: "Perkantoran",
    x: 13, z: 0, width: 3, depth: 3, height: 6,
    color: "#91a9bd", description: "Kawasan aktivitas perusahaan dan perkantoran."
  },
  {
    id: 7, name: "Perumahan Warga", type: "Permukiman",
    x: -13, z: -8, width: 2.8, depth: 2.8, height: 2,
    color: "#d5b18a", description: "Tempat tinggal masyarakat."
  },
  {
    id: 8, name: "Perumahan Warga II", type: "Permukiman",
    x: 13, z: 8, width: 2.8, depth: 2.8, height: 2,
    color: "#cda58b", description: "Kawasan hunian penduduk."
  },
];

function Building({
  data,
  onSelect,
}: {
  data: BuildingData;
  onSelect: (building: BuildingData) => void;
}) {
  const isMosque = data.id === 3;
  const isPalace = data.id === 1;
  const isHospital = data.id === 4;
  const isHouse = data.id === 7 || data.id === 8;

  return (
    <group
      position={[data.x, 0, data.z]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(data);
      }}
    >
      {/* Pondasi */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[data.width + 0.5, 0.3, data.depth + 0.5]} />
        <meshStandardMaterial color="#aaa69b" />
      </mesh>

      {/* Badan bangunan */}
      <mesh position={[0, data.height / 2 + 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[data.width, data.height, data.depth]} />
        <meshStandardMaterial color={data.color} roughness={0.75} />
      </mesh>

      {/* Atap */}
      <mesh position={[0, data.height + 0.4, 0]} castShadow>
        <boxGeometry args={[data.width + 0.2, 0.25, data.depth + 0.2]} />
        <meshStandardMaterial color={isMosque ? "#328d70" : isPalace ? "#b99b58" : "#555d68"} />
      </mesh>

      {/* Kubah masjid */}
      {isMosque && (
        <>
          <mesh position={[0, data.height + 1.15, 0]} castShadow>
            <sphereGeometry args={[0.9, 24, 16]} />
            <meshStandardMaterial color="#328d70" roughness={0.4} />
          </mesh>
          <mesh position={[0, data.height + 2.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.65, 8]} />
            <meshStandardMaterial color="#d5b45b" metalness={0.6} />
          </mesh>
        </>
      )}

      {/* Menara masjid */}
      {isMosque && (
        <group position={[data.width / 2 - 0.1, 0, data.depth / 2 - 0.1]}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 4.2, 8]} />
            <meshStandardMaterial color="#e8dfc8" />
          </mesh>
          <mesh position={[0, 4.5, 0]}>
            <coneGeometry args={[0.35, 0.8, 8]} />
            <meshStandardMaterial color="#328d70" />
          </mesh>
        </group>
      )}

      {/* Pilar istana */}
      {isPalace && (
        <>
          {[-1.3, -0.45, 0.45, 1.3].map((x) => (
            <mesh key={x} position={[x, 1.45, data.depth / 2 + 0.06]} castShadow>
              <cylinderGeometry args={[0.09, 0.09, 2.3, 10]} />
              <meshStandardMaterial color="#f5f0e5" />
            </mesh>
          ))}
        </>
      )}

      {/* Tanda palang rumah sakit */}
      {isHospital && (
        <group position={[0, data.height + 0.75, data.depth / 2 + 0.03]}>
          <mesh>
            <boxGeometry args={[0.85, 0.22, 0.12]} />
            <meshStandardMaterial color="#d84b4b" />
          </mesh>
          <mesh>
            <boxGeometry args={[0.22, 0.85, 0.12]} />
            <meshStandardMaterial color="#d84b4b" />
          </mesh>
        </group>
      )}

      {/* Atap rumah sederhana */}
      {isHouse && (
        <mesh position={[0, data.height + 0.95, 0]} castShadow>
          <coneGeometry args={[data.width * 0.8, 1.4, 4]} />
          <meshStandardMaterial color="#9b5740" />
        </mesh>
      )}

      {/* Pintu */}
      <mesh position={[0, 0.85, data.depth / 2 + 0.015]}>
        <boxGeometry args={[0.65, 1.4, 0.08]} />
        <meshStandardMaterial color="#654b38" />
      </mesh>

      {/* Jendela */}
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, data.height * 0.65, data.depth / 2 + 0.02]}>
          <boxGeometry args={[0.5, 0.65, 0.08]} />
          <meshStandardMaterial color="#83b9ce" metalness={0.25} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.4, 8]} />
        <meshStandardMaterial color="#765039" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshStandardMaterial color="#438456" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Road() {
  return (
    <group>
      {/* Jalan horizontal */}
      <mesh position={[0, 0.035, 0]} receiveShadow>
        <boxGeometry args={[42, 0.07, 3.5]} />
        <meshStandardMaterial color="#41464b" />
      </mesh>

      {/* Jalan vertikal */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[3.5, 0.08, 42]} />
        <meshStandardMaterial color="#41464b" />
      </mesh>

      {/* Garis jalan */}
      {Array.from({ length: 12 }, (_, i) => (
        <group key={i}>
          <mesh position={[-19 + i * 3.5, 0.08, 0]}>
            <boxGeometry args={[1.5, 0.025, 0.12]} />
            <meshStandardMaterial color="#f1d77c" />
          </mesh>
          <mesh position={[0, 0.085, -19 + i * 3.5]}>
            <boxGeometry args={[0.12, 0.025, 1.5]} />
            <meshStandardMaterial color="#f1d77c" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function World({
  onSelect,
  move,
  look,
}: {
  onSelect: (building: BuildingData) => void;
  move: MoveInput;
  look: LookInput;
}) {
  return (
    <>
      <color attach="background" args={["#b9cbd0"]} />
      <ambientLight intensity={1.1} />
      <directionalLight
        position={[12, 20, 10]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Tanah kota */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[46, 46]} />
        <meshStandardMaterial color="#91a987" />
      </mesh>

      {/* Taman pusat */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[8, 0.16, 8]} />
        <meshStandardMaterial color="#6e9b66" />
      </mesh>

      {/* Kolam di taman */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#60b5c9" metalness={0.3} roughness={0.2} />
      </mesh>

      <Road />
      
      <Player move={move} look={look} />

      <CitizenSystem />
      
      {/* Pepohonan */}
      {[
        [-4, 0, -5], [4, 0, -5], [-4, 0, 5], [4, 0, 5],
        [-17, 0, -5], [-17, 0, 5], [17, 0, -5], [17, 0, 5],
        [-5, 0, -17], [5, 0, -17], [-5, 0, 17], [5, 0, 17],
      ].map((position, i) => (
        <Tree key={i} position={position as [number, number, number]} />
      ))}

      {/* Bangunan */}
      {buildings.map((building) => (
        <Building key={building.id} data={building} onSelect={onSelect} />
      ))}

    </>
  );
}

export default function App() {
  const [selected, setSelected] = useState<BuildingData | null>(null);

  const [move, setMove] = useState<MoveInput>({
    x: 0,
    y: 0,
  });

  const [look, setLook] = useState<LookInput>({
    yaw: 0,
    pitch: 0.15,
  });

  function handleLook(dx: number, dy: number) {
    setLook((previous) => ({
      yaw: previous.yaw - dx * 0.005,
      pitch: Math.max(-0.2, Math.min(0.8, previous.pitch + dy * 0.003)),
    }));
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <div className="brand">VIRTUAL NATION</div>
          <div className="subtitle">Simulasi pembangunan sebuah negara</div>
        </div>
        <div className="country-status">
          <span className="status-dot" />
          NEGARA NUSANTARA
        </div>
      </header>

      <section className="world-container">
        <Canvas
          shadows
          camera={{
            position: [0, 3, 6],
            fov: 60,
            near: 0.1,
            far: 200,
          }}
          onPointerMissed={() => setSelected(null)}
        >
          <World
            onSelect={setSelected}
            move={move}
            look={look}
          />
        </Canvas>

<MobileControls
  onMove={setMove}
  onLook={handleLook}
/>

<div className="rotate-hint">
  Putar HP kamu ke posisi horizontal untuk bermain
</div>

        <div className="map-label">
          <span>01</span> IBU KOTA NUSANTARA
        </div>

        <div className="controls-hint">
          Klik bangunan untuk melihat informasi
          <br />
          Geser untuk memutar · Scroll untuk zoom
        </div>

        {selected && (
          <aside className="building-panel">
            <button className="close-button" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="panel-label">INFORMASI BANGUNAN</div>
            <h2>{selected.name}</h2>
            <div className="building-type">{selected.type}</div>
            <p>{selected.description}</p>
            <div className="panel-divider" />
            <div className="building-stat">
              <span>Status</span>
              <strong>Beroperasi</strong>
            </div>
            <div className="building-stat">
              <span>ID Bangunan</span>
              <strong>VN-{String(selected.id).padStart(3, "0")}</strong>
            </div>
          </aside>
        )}
      </section>

      <footer className="bottom-bar">
        <div><strong>08</strong><span>Bangunan</span></div>
        <div><strong>12</strong><span>Penduduk</span></div>
        <div><strong>01</strong><span>Kawasan Kota</span></div>
        <div><strong>01</strong><span>Negara</span></div>
        <div className="prototype-tag">PROTOTYPE V 0.1</div>
      </footer>
    </main>
  );
}
