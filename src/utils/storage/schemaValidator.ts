import type {
  WorldData,
  WorldMetadata,
  WorldObject,
  RoadData,
  RoadNode,
  RoadSegment,
  TerrainData,
  WaterBody,
  ZoneData,
  ZoneCell,
  WorldBounds,
  RoadType,
  RoadSurface,
  ZoneType,
  WaterBodyType,
} from '../../types/world';
import { assetRegistry } from '../../registry/assetRegistry';
import {
  isValidNumber,
  isValidString,
  isValidVector3,
  isValidRotation,
  isValidScale,
} from './validationRules';
import { getFreshDefaultWorldData } from '../../constants/defaultWorld';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: WorldData | null;
}

const VALID_ROAD_TYPES: Set<RoadType> = new Set(['HIGHWAY', 'AVENUE', 'STREET', 'ALLEY']);
const VALID_ROAD_SURFACES: Set<RoadSurface> = new Set(['ASPHALT', 'CONCRETE', 'COBBLESTONE', 'DIRT']);
const VALID_ZONE_TYPES: Set<ZoneType> = new Set([
  'RESIDENTIAL',
  'COMMERCIAL',
  'INDUSTRIAL',
  'CIVIC',
  'PARK',
  'UNZONED',
]);
const VALID_WATER_TYPES: Set<WaterBodyType> = new Set(['LAKE', 'RIVER', 'POND']);

/**
 * Memetakan ID numerik gedung prototipe ke assetId baru
 */
function mapLegacyBuildingIdToAssetId(id: number): string | null {
  switch (id) {
    case 1:
      return 'bld_palace';
    case 2:
      return 'bld_government';
    case 3:
      return 'bld_mosque';
    case 4:
      return 'bld_hospital';
    case 5:
      return 'bld_market';
    case 6:
      return 'bld_office';
    case 7:
      return 'bld_house_1';
    case 8:
      return 'bld_house_2';
    default:
      return null;
  }
}

/**
 * Memeriksa apakah input merupakan data prototipe lama (array gedung atau objek dengan buildings)
 */
function isLegacyPrototypeData(raw: Record<string, unknown>): boolean {
  if (Array.isArray(raw.buildings) && !raw.metadata) {
    return true;
  }
  return false;
}

/**
 * Melakukan validasi runtime menyeluruh dan migrasi schema data dunia
 * TIDAK memutasi input asli.
 */
export function validateAndMigrateWorldData(rawInput: unknown): ValidationReport {
  const report: ValidationReport = {
    isValid: false,
    errors: [],
    warnings: [],
    data: null,
  };

  if (!rawInput || typeof rawInput !== 'object') {
    report.errors.push('Data input bukan berupa objek JSON yang valid.');
    return report;
  }

  // Buat deep clone independen dari input untuk memastikan input asli tidak pernah termutasi
  const raw = JSON.parse(JSON.stringify(rawInput)) as Record<string, unknown>;

  // -------------------------------------------------------------
  // 1. DETEKSI & MIGRASI DATA PROTOTIPE LAMA
  // -------------------------------------------------------------
  let candidateData: Record<string, unknown> = raw;

  if (isLegacyPrototypeData(raw)) {
    report.warnings.push(
      'Mendeteksi format data prototipe v0 (daftar gedung statis). Melakukan migrasi ke skema v1.'
    );
    const fresh = getFreshDefaultWorldData();
    const legacyBuildings = raw.buildings as Record<string, unknown>[];
    const migratedObjects: WorldObject[] = [];

    legacyBuildings.forEach((b, index) => {
      const numId = Number(b.id);
      const mappedAssetId = mapLegacyBuildingIdToAssetId(numId);
      if (!mappedAssetId) {
        report.warnings.push(
          `Gedung legacy dengan ID ${b.id} tidak dikenal dan diabaikan dalam migrasi.`
        );
        return;
      }

      const x = isValidNumber(b.x) ? b.x : 0;
      const z = isValidNumber(b.z) ? b.z : 0;

      migratedObjects.push({
        id: `migrated_obj_${index + 1}_${Date.now()}`,
        assetId: mappedAssetId,
        customName: typeof b.name === 'string' ? b.name : undefined,
        position: [x, 0, z],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        isLocked: numId === 1,
        metadata: {
          originalId: numId,
          legacyType: b.type,
          description: b.description,
        },
      });
    });

    candidateData = {
      metadata: fresh.metadata,
      objects: migratedObjects,
      roads: fresh.roads,
      terrain: fresh.terrain,
      zones: fresh.zones,
    };
  }

  // -------------------------------------------------------------
  // 2. VALIDASI METADATA
  // -------------------------------------------------------------
  const rawMeta = candidateData.metadata as Record<string, unknown> | undefined;
  if (!rawMeta || typeof rawMeta !== 'object') {
    report.errors.push('Properti "metadata" wajib ada dan harus berupa objek.');
    return report;
  }

  if (!isValidString(rawMeta.id)) {
    report.errors.push('Metadata "id" wajib berupa string tidak kosong.');
  }
  if (!isValidString(rawMeta.nationName)) {
    report.errors.push('Metadata "nationName" wajib berupa string tidak kosong.');
  }
  if (!isValidString(rawMeta.cityName)) {
    report.errors.push('Metadata "cityName" wajib berupa string tidak kosong.');
  }
  if (!isValidNumber(rawMeta.version) || rawMeta.version < 1) {
    report.errors.push('Metadata "version" wajib berupa angka integer >= 1.');
  }

  const rawBounds = rawMeta.bounds as Record<string, unknown> | undefined;
  if (
    !rawBounds ||
    !isValidNumber(rawBounds.minX) ||
    !isValidNumber(rawBounds.maxX) ||
    !isValidNumber(rawBounds.minZ) ||
    !isValidNumber(rawBounds.maxZ) ||
    rawBounds.minX >= rawBounds.maxX ||
    rawBounds.minZ >= rawBounds.maxZ
  ) {
    report.errors.push('Metadata "bounds" tidak valid (minX harus < maxX dan minZ harus < maxZ).');
  }

  if (report.errors.length > 0) {
    return report;
  }

  const bounds: WorldBounds = {
    minX: rawBounds!.minX as number,
    maxX: rawBounds!.maxX as number,
    minZ: rawBounds!.minZ as number,
    maxZ: rawBounds!.maxZ as number,
  };

  const metadata: WorldMetadata = {
    id: rawMeta.id as string,
    nationName: rawMeta.nationName as string,
    cityName: rawMeta.cityName as string,
    version: rawMeta.version as number,
    createdAt: isValidNumber(rawMeta.createdAt) ? (rawMeta.createdAt as number) : Date.now(),
    updatedAt: isValidNumber(rawMeta.updatedAt) ? (rawMeta.updatedAt as number) : Date.now(),
    gridSize: isValidNumber(rawMeta.gridSize) && (rawMeta.gridSize as number) > 0 ? (rawMeta.gridSize as number) : 1.0,
    bounds,
  };

  // -------------------------------------------------------------
  // 3. VALIDASI OBJECTS
  // -------------------------------------------------------------
  if (!Array.isArray(candidateData.objects)) {
    report.errors.push('Properti "objects" wajib berupa array.');
    return report;
  }

  const validatedObjects: WorldObject[] = [];
  const rawObjects = candidateData.objects as Record<string, unknown>[];

  for (let i = 0; i < rawObjects.length; i++) {
    const rawObj = rawObjects[i];
    if (!rawObj || typeof rawObj !== 'object') {
      report.warnings.push(`Objek pada indeks ${i} diabaikan karena bukan objek yang valid.`);
      continue;
    }

    if (!isValidString(rawObj.id)) {
      report.warnings.push(`Objek pada indeks ${i} diabaikan: ID tidak valid.`);
      continue;
    }

    if (!isValidString(rawObj.assetId)) {
      report.warnings.push(`Objek "${rawObj.id}" diabaikan: assetId tidak valid.`);
      continue;
    }

    // Periksa apakah assetId terdaftar di AssetRegistry
    if (!assetRegistry.has(rawObj.assetId)) {
      report.warnings.push(
        `Objek "${rawObj.id}" merujuk pada assetId "${rawObj.assetId}" yang tidak terdaftar di AssetRegistry. Objek dikarantina (diabaikan).`
      );
      continue;
    }

    // Validasi posisi dalam batas dunia
    if (!isValidVector3(rawObj.position, bounds)) {
      report.warnings.push(
        `Objek "${rawObj.id}" memiliki posisi [${rawObj.position}] di luar batas dunia atau bernilai non-finite. Objek diabaikan.`
      );
      continue;
    }

    // Validasi rotasi
    let rotation = rawObj.rotation;
    if (!isValidRotation(rotation)) {
      report.warnings.push(`Objek "${rawObj.id}" memiliki rotasi tidak valid. Direset ke [0, 0, 0].`);
      rotation = [0, 0, 0];
    }

    // Validasi skala
    let scale = rawObj.scale;
    if (!isValidScale(scale)) {
      report.warnings.push(`Objek "${rawObj.id}" memiliki skala tidak valid. Direset ke [1, 1, 1].`);
      scale = [1, 1, 1];
    }

    validatedObjects.push({
      id: rawObj.id as string,
      assetId: rawObj.assetId as string,
      customName: typeof rawObj.customName === 'string' ? rawObj.customName : undefined,
      position: rawObj.position as [number, number, number],
      rotation: rotation as [number, number, number],
      scale: scale as [number, number, number],
      isLocked: typeof rawObj.isLocked === 'boolean' ? rawObj.isLocked : false,
      metadata:
        rawObj.metadata && typeof rawObj.metadata === 'object'
          ? (rawObj.metadata as Record<string, unknown>)
          : undefined,
    });
  }

  // -------------------------------------------------------------
  // 4. VALIDASI ROADS
  // -------------------------------------------------------------
  const fresh = getFreshDefaultWorldData();
  let validatedRoads: RoadData = fresh.roads;

  if (candidateData.roads && typeof candidateData.roads === 'object') {
    const rawRoads = candidateData.roads as Record<string, unknown>;
    const nodes: RoadNode[] = [];
    const segments: RoadSegment[] = [];
    const nodeIds = new Set<string>();

    if (Array.isArray(rawRoads.nodes)) {
      for (const rawNode of rawRoads.nodes as Record<string, unknown>[]) {
        if (rawNode && isValidString(rawNode.id) && isValidVector3(rawNode.position)) {
          nodes.push({
            id: rawNode.id,
            position: rawNode.position as [number, number, number],
            intersection:
              rawNode.intersection && typeof rawNode.intersection === 'object'
                ? (rawNode.intersection as RoadNode['intersection'])
                : undefined,
          });
          nodeIds.add(rawNode.id);
        }
      }
    }

    if (Array.isArray(rawRoads.segments)) {
      for (const rawSeg of rawRoads.segments as Record<string, unknown>[]) {
        if (
          rawSeg &&
          isValidString(rawSeg.id) &&
          isValidString(rawSeg.startNodeId) &&
          isValidString(rawSeg.endNodeId) &&
          nodeIds.has(rawSeg.startNodeId) &&
          nodeIds.has(rawSeg.endNodeId)
        ) {
          const type: RoadType = VALID_ROAD_TYPES.has(rawSeg.type as RoadType)
            ? (rawSeg.type as RoadType)
            : 'STREET';
          const surface: RoadSurface = VALID_ROAD_SURFACES.has(rawSeg.surface as RoadSurface)
            ? (rawSeg.surface as RoadSurface)
            : 'ASPHALT';

          segments.push({
            id: rawSeg.id,
            startNodeId: rawSeg.startNodeId,
            endNodeId: rawSeg.endNodeId,
            type,
            width: isValidNumber(rawSeg.width) && rawSeg.width > 0 ? (rawSeg.width as number) : 3.5,
            lanes: isValidNumber(rawSeg.lanes) && rawSeg.lanes >= 1 ? Math.floor(rawSeg.lanes as number) : 2,
            surface,
            hasSidewalks: Boolean(rawSeg.hasSidewalks),
            sidewalkWidth: isValidNumber(rawSeg.sidewalkWidth) ? (rawSeg.sidewalkWidth as number) : undefined,
            speedLimit: isValidNumber(rawSeg.speedLimit) ? (rawSeg.speedLimit as number) : undefined,
          });
        }
      }
    }

    if (nodes.length > 0) {
      validatedRoads = { nodes, segments };
    }
  }

  // -------------------------------------------------------------
  // 5. VALIDASI TERRAIN
  // -------------------------------------------------------------
  let validatedTerrain: TerrainData = fresh.terrain;

  if (candidateData.terrain && typeof candidateData.terrain === 'object') {
    const rawTerrain = candidateData.terrain as Record<string, unknown>;
    const dims = rawTerrain.dimensions;
    const isValidDim =
      Array.isArray(dims) &&
      dims.length === 2 &&
      isValidNumber(dims[0]) &&
      isValidNumber(dims[1]) &&
      dims[0] > 0 &&
      dims[1] > 0;

    const waterBodies: WaterBody[] = [];
    if (Array.isArray(rawTerrain.waterBodies)) {
      for (const rawW of rawTerrain.waterBodies as Record<string, unknown>[]) {
        if (
          rawW &&
          isValidString(rawW.id) &&
          isValidVector3(rawW.position) &&
          Array.isArray(rawW.dimensions) &&
          rawW.dimensions.length === 2 &&
          isValidNumber(rawW.dimensions[0]) &&
          isValidNumber(rawW.dimensions[1])
        ) {
          const type: WaterBodyType = VALID_WATER_TYPES.has(rawW.type as WaterBodyType)
            ? (rawW.type as WaterBodyType)
            : 'POND';

          waterBodies.push({
            id: rawW.id,
            type,
            position: rawW.position as [number, number, number],
            dimensions: [rawW.dimensions[0], rawW.dimensions[1]],
          });
        }
      }
    }

    validatedTerrain = {
      dimensions: isValidDim ? [dims[0], dims[1]] : fresh.terrain.dimensions,
      baseElevation: isValidNumber(rawTerrain.baseElevation)
        ? (rawTerrain.baseElevation as number)
        : fresh.terrain.baseElevation,
      groundColor: isValidString(rawTerrain.groundColor)
        ? (rawTerrain.groundColor as string)
        : fresh.terrain.groundColor,
      waterBodies,
    };
  }

  // -------------------------------------------------------------
  // 6. VALIDASI ZONES
  // -------------------------------------------------------------
  let validatedZones: ZoneData = fresh.zones;

  if (candidateData.zones && typeof candidateData.zones === 'object') {
    const rawZones = candidateData.zones as Record<string, unknown>;
    const cellSize =
      isValidNumber(rawZones.cellSize) && (rawZones.cellSize as number) > 0
        ? (rawZones.cellSize as number)
        : fresh.zones.cellSize;

    const cells: ZoneCell[] = [];
    if (Array.isArray(rawZones.cells)) {
      for (const rawCell of rawZones.cells as Record<string, unknown>[]) {
        if (
          rawCell &&
          isValidNumber(rawCell.gridX) &&
          isValidNumber(rawCell.gridZ) &&
          VALID_ZONE_TYPES.has(rawCell.type as ZoneType)
        ) {
          cells.push({
            gridX: Math.floor(rawCell.gridX as number),
            gridZ: Math.floor(rawCell.gridZ as number),
            type: rawCell.type as ZoneType,
          });
        }
      }
    }

    validatedZones = { cellSize, cells };
  }

  // -------------------------------------------------------------
  // 7. HASIL AKHIR
  // -------------------------------------------------------------
  report.isValid = true;
  report.data = {
    metadata,
    objects: validatedObjects,
    roads: validatedRoads,
    terrain: validatedTerrain,
    zones: validatedZones,
  };

  return report;
}
