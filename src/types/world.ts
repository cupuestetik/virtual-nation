export type Vector3Tuple = [number, number, number];
export type RotationTuple = [number, number, number];

// ==========================================
// 1. WORLD OBJECT DATA (Bangunan & Prop)
// ==========================================
export interface WorldObject {
  /** Unique instance ID (misal: "obj_1731920000000_abc123") */
  id: string;

  /** Referensi ke ID blueprint di AssetRegistry (misal: "bld_palace") */
  assetId: string;

  /** Nama kustom yang dapat diatur oleh pemain */
  customName?: string;

  /** Posisi spasial [x, y, z] */
  position: Vector3Tuple;

  /** Sudut rotasi Euler [rotX, rotY, rotZ] dalam satuan radian */
  rotation: RotationTuple;

  /** Skala spasial [scaleX, scaleY, scaleZ] */
  scale: Vector3Tuple;

  /** Status kunci objek (mencegah edit/hapus tak sengaja) */
  isLocked?: boolean;

  /** Metadata dinamis tambahan untuk masa depan */
  metadata?: Record<string, unknown>;
}

// ==========================================
// 2. ROAD DATA (Jaringan Jalan & Infrastruktur)
// ==========================================
export type RoadType = 'HIGHWAY' | 'AVENUE' | 'STREET' | 'ALLEY';
export type RoadSurface = 'ASPHALT' | 'CONCRETE' | 'COBBLESTONE' | 'DIRT';
export type IntersectionType = 'STANDARD' | 'TRAFFIC_LIGHT' | 'ROUNDABOUT';

export interface RoadIntersectionConfig {
  type: IntersectionType;
  hasCrosswalks?: boolean;
}

export interface RoadNode {
  id: string;
  position: Vector3Tuple;
  intersection?: RoadIntersectionConfig;
}

export interface RoadSegment {
  id: string;
  startNodeId: string;
  endNodeId: string;
  type: RoadType;
  width: number;
  lanes: number;
  surface: RoadSurface;
  hasSidewalks: boolean;
  sidewalkWidth?: number;
  speedLimit?: number;
}

export interface RoadData {
  nodes: RoadNode[];
  segments: RoadSegment[];
}

// ==========================================
// 3. TERRAIN DATA (Topografi & Perairan)
// ==========================================
export type WaterBodyType = 'LAKE' | 'RIVER' | 'POND';

export interface WaterBody {
  id: string;
  type: WaterBodyType;
  position: Vector3Tuple;
  dimensions: [number, number];
}

export interface TerrainData {
  dimensions: [number, number]; // [width, depth] (misal: [46, 46])
  baseElevation: number;
  groundColor: string;
  waterBodies: WaterBody[];
}

// ==========================================
// 4. ZONE DATA (Tata Ruang Kota)
// ==========================================
export type ZoneType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'CIVIC' | 'PARK' | 'UNZONED';

export interface ZoneCell {
  gridX: number;
  gridZ: number;
  type: ZoneType;
}

export interface ZoneData {
  cellSize: number;
  cells: ZoneCell[];
}

// ==========================================
// 5. METADATA & WORLD DATA UTAMA
// ==========================================
export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WorldMetadata {
  id: string;
  nationName: string;
  cityName: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  gridSize: number;
  bounds: WorldBounds;
}

export interface WorldData {
  metadata: WorldMetadata;
  objects: WorldObject[];
  roads: RoadData;
  terrain: TerrainData;
  zones: ZoneData;
}
