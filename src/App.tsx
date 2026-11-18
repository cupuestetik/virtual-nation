import Player, { type MoveInput, type LookInput } from "./Player";
import MobileControls from "./MobileControls";
import CitizenSystem from "./Citizen";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useWorldStore } from "./stores/useWorldStore";
import { useEditorStore } from "./stores/useEditorStore";
import { WorldRenderer } from "./components/world/WorldRenderer";
import { BuildCamera } from "./components/camera/BuildCamera";
import type { WorldObject } from "./types/world";
import type { AssetDefinition } from "./types/asset";
import "./style.css";

export interface SelectedBuildingInfo {
  id: number | string;
  name: string;
  type: string;
  description: string;
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
  onSelect: (object: WorldObject, definition: AssetDefinition) => void;
  move: MoveInput;
  look: LookInput;
}) {
  const mode = useEditorStore((state) => state.mode);
  const isGameplay = mode === "GAMEPLAY";

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
      
      {/* Karakter Pemain (Kontrol pergerakan & kamera hanya aktif di Gameplay Mode) */}
      <Player move={move} look={look} active={isGameplay} />

      {/* Sistem Warga (Pergerakan berhenti otomatis saat Build Mode) */}
      <CitizenSystem active={isGameplay} />

      {/* Kamera khusus Build Mode (Hanya aktif saat Build Mode) */}
      {!isGameplay && <BuildCamera />}
      
      {/* Pepohonan Lingkungan */}
      {[
        [-4, 0, -5], [4, 0, -5], [-4, 0, 5], [4, 0, 5],
        [-17, 0, -5], [-17, 0, 5], [17, 0, -5], [17, 0, 5],
        [-5, 0, -17], [5, 0, -17], [-5, 0, 17], [5, 0, 17],
      ].map((position, i) => (
        <Tree key={i} position={position as [number, number, number]} />
      ))}

      {/* Seluruh Bangunan Dirender Dinamis dari WorldStore via WorldRenderer (SHARED oleh kedua mode) */}
      <WorldRenderer onSelect={onSelect} />
    </>
  );
}

export default function App() {
  const [selected, setSelected] = useState<SelectedBuildingInfo | null>(null);
  const buildingCount = useWorldStore((state) => state.objects.length);
  const mode = useEditorStore((state) => state.mode);
  const setMode = useEditorStore((state) => state.setMode);
  const isGameplay = mode === "GAMEPLAY";

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

  function handleSelectBuilding(object: WorldObject, definition: AssetDefinition) {
    const rawId = object.metadata?.originalId ?? object.id.replace(/\D/g, '') ?? 1;
    const numId = Number(rawId) || 1;
    setSelected({
      id: numId,
      name: object.customName || definition.name,
      type: (object.metadata?.type as string) || definition.category,
      description: definition.description,
    });
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <div className="brand">VIRTUAL NATION</div>
          <div className="subtitle">Simulasi pembangunan sebuah negara</div>
        </div>

        {/* Pengalih Mode Permainan (Mode Switcher) */}
        <div className="mode-switcher" role="group" aria-label="Mode Permainan">
          <button
            type="button"
            className={`mode-btn ${isGameplay ? "active" : ""}`}
            onClick={() => setMode("GAMEPLAY")}
          >
            🎮 GAMEPLAY
          </button>
          <button
            type="button"
            className={`mode-btn ${!isGameplay ? "active" : ""}`}
            onClick={() => setMode("BUILD")}
          >
            🏗️ BUILD MODE
          </button>
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
            onSelect={handleSelectBuilding}
            move={move}
            look={look}
          />
        </Canvas>

        {/* Kontrol sentuh mobile hanya aktif dan muncul di Gameplay Mode */}
        {isGameplay && (
          <MobileControls
            onMove={setMove}
            onLook={handleLook}
          />
        )}

        <div className="rotate-hint">
          Putar HP kamu ke posisi horizontal untuk bermain
        </div>

        <div className="map-label">
          <span>{isGameplay ? "01" : "BUILD"}</span>{" "}
          {isGameplay ? "IBU KOTA NUSANTARA" : "NAVIGASI ARSITEK KOTA"}
        </div>

        <div className="controls-hint">
          {isGameplay ? (
            <>
              Gunakan joystick untuk gerak · Geser kanan untuk arah kamera
              <br />
              Klik bangunan untuk melihat informasi
            </>
          ) : (
            <>
              Geser 1 jari / klik kiri untuk putar · 2 jari / klik kanan untuk geser
              <br />
              Scroll / cubit untuk zoom · Kamera terbatas di area kota
            </>
          )}
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
        <div><strong>{String(buildingCount).padStart(2, "0")}</strong><span>Bangunan</span></div>
        <div><strong>12</strong><span>Penduduk</span></div>
        <div><strong>01</strong><span>Kawasan Kota</span></div>
        <div><strong>01</strong><span>Negara</span></div>
        <div className="prototype-tag">{isGameplay ? "GAMEPLAY V 0.3" : "BUILD MODE"}</div>
      </footer>
    </main>
  );
}
