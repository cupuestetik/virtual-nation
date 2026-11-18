import type { WorldData } from '../types/world';

export function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = (obj as Record<string, unknown>)[prop];
    if (
      val !== null &&
      (typeof val === 'object' || typeof val === 'function') &&
      !Object.isFrozen(val)
    ) {
      deepFreeze(val);
    }
  });
  return obj;
}

const rawInitialWorldData: WorldData = {
  metadata: {
    id: 'vn_world_default',
    nationName: 'NEGARA NUSANTARA',
    cityName: 'IBU KOTA NUSANTARA',
    version: 1,
    createdAt: 1731920000000,
    updatedAt: 1731920000000,
    gridSize: 1.0,
    bounds: {
      minX: -23,
      maxX: 23,
      minZ: -23,
      maxZ: 23,
    },
  },
  objects: [
    {
      id: 'vn_bld_001',
      assetId: 'bld_palace',
      customName: 'Istana Presiden',
      position: [-7, 0, -7],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: true,
      metadata: { originalId: 1, type: 'Istana Kepresidenan' },
    },
    {
      id: 'vn_bld_002',
      assetId: 'bld_government',
      customName: 'Gedung Pemerintahan',
      position: [7, 0, -7],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: false,
      metadata: { originalId: 2, type: 'Kantor Pemerintah' },
    },
    {
      id: 'vn_bld_003',
      assetId: 'bld_mosque',
      customName: 'Masjid Raya',
      position: [-7, 0, 7],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: false,
      metadata: { originalId: 3, type: 'Tempat Ibadah' },
    },
    {
      id: 'vn_bld_004',
      assetId: 'bld_hospital',
      customName: 'Rumah Sakit Nasional',
      position: [7, 0, 7],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: false,
      metadata: { originalId: 4, type: 'Fasilitas Kesehatan' },
    },
    {
      id: 'vn_bld_005',
      assetId: 'bld_market',
      customName: 'Pasar Nusantara',
      position: [-13, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: false,
      metadata: { originalId: 5, type: 'Pusat Perdagangan' },
    },
    {
      id: 'vn_bld_006',
      assetId: 'bld_office',
      customName: 'Gedung Perkantoran',
      position: [13, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: false,
      metadata: { originalId: 6, type: 'Perkantoran' },
    },
    {
      id: 'vn_bld_007',
      assetId: 'bld_house_1',
      customName: 'Perumahan Warga',
      position: [-13, 0, -8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: false,
      metadata: { originalId: 7, type: 'Permukiman' },
    },
    {
      id: 'vn_bld_008',
      assetId: 'bld_house_2',
      customName: 'Perumahan Warga II',
      position: [13, 0, 8],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isLocked: false,
      metadata: { originalId: 8, type: 'Permukiman' },
    },
  ],
  roads: {
    nodes: [
      {
        id: 'road_node_center',
        position: [0, 0, 0],
        intersection: { type: 'STANDARD', hasCrosswalks: true },
      },
      { id: 'road_node_north', position: [0, 0, -21] },
      { id: 'road_node_south', position: [0, 0, 21] },
      { id: 'road_node_west', position: [-21, 0, 0] },
      { id: 'road_node_east', position: [21, 0, 0] },
    ],
    segments: [
      {
        id: 'road_seg_n',
        startNodeId: 'road_node_center',
        endNodeId: 'road_node_north',
        type: 'AVENUE',
        width: 3.5,
        lanes: 2,
        surface: 'ASPHALT',
        hasSidewalks: true,
        sidewalkWidth: 0.8,
        speedLimit: 40,
      },
      {
        id: 'road_seg_s',
        startNodeId: 'road_node_center',
        endNodeId: 'road_node_south',
        type: 'AVENUE',
        width: 3.5,
        lanes: 2,
        surface: 'ASPHALT',
        hasSidewalks: true,
        sidewalkWidth: 0.8,
        speedLimit: 40,
      },
      {
        id: 'road_seg_w',
        startNodeId: 'road_node_center',
        endNodeId: 'road_node_west',
        type: 'AVENUE',
        width: 3.5,
        lanes: 2,
        surface: 'ASPHALT',
        hasSidewalks: true,
        sidewalkWidth: 0.8,
        speedLimit: 40,
      },
      {
        id: 'road_seg_e',
        startNodeId: 'road_node_center',
        endNodeId: 'road_node_east',
        type: 'AVENUE',
        width: 3.5,
        lanes: 2,
        surface: 'ASPHALT',
        hasSidewalks: true,
        sidewalkWidth: 0.8,
        speedLimit: 40,
      },
    ],
  },
  terrain: {
    dimensions: [46, 46],
    baseElevation: 0,
    groundColor: '#91a987',
    waterBodies: [
      {
        id: 'water_center_pond',
        type: 'POND',
        position: [0, 0.18, 0],
        dimensions: [1.5, 1.5],
      },
    ],
  },
  zones: {
    cellSize: 2,
    cells: [],
  },
};

// Bekukan objek acuan agar tidak dapat diubah sama sekali
export const initialWorldData: Readonly<WorldData> = deepFreeze(rawInitialWorldData);

/**
 * Mengembalikan salinan independen baru (deep clone) dari data dunia awal
 */
export function getFreshDefaultWorldData(): WorldData {
  return JSON.parse(JSON.stringify(rawInitialWorldData));
}
