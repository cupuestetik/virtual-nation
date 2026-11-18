import type { Vector3Tuple, RotationTuple, WorldBounds } from '../../types/world';

/**
 * Memeriksa apakah nilai merupakan angka valid dan finite (bukan NaN atau Infinity)
 */
export function isValidNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val);
}

/**
 * Memeriksa apakah nilai merupakan string tidak kosong
 */
export function isValidString(val: unknown, minLength = 1): val is string {
  return typeof val === 'string' && val.trim().length >= minLength;
}

/**
 * Memeriksa apakah posisi [x, y, z] berada di dalam batas dunia
 */
export function isWithinBounds(pos: Vector3Tuple, bounds: WorldBounds): boolean {
  const [x, , z] = pos;
  return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ;
}

/**
 * Memvalidasi apakah suatu nilai merupakan tuple Vector3 valid [x, y, z]
 */
export function isValidVector3(val: unknown, bounds?: WorldBounds): val is Vector3Tuple {
  if (!Array.isArray(val) || val.length !== 3) {
    return false;
  }
  const [x, y, z] = val;
  if (!isValidNumber(x) || !isValidNumber(y) || !isValidNumber(z)) {
    return false;
  }
  if (bounds && !isWithinBounds([x, y, z], bounds)) {
    return false;
  }
  return true;
}

/**
 * Memvalidasi apakah suatu nilai merupakan tuple Rotasi valid [rotX, rotY, rotZ]
 */
export function isValidRotation(val: unknown): val is RotationTuple {
  if (!Array.isArray(val) || val.length !== 3) {
    return false;
  }
  const [rx, ry, rz] = val;
  return isValidNumber(rx) && isValidNumber(ry) && isValidNumber(rz);
}

/**
 * Memvalidasi apakah suatu nilai merupakan tuple Skala valid [scaleX, scaleY, scaleZ]
 * Skala harus finite, positif strictly > 0, dan berada dalam rentang wajar
 */
export function isValidScale(
  val: unknown,
  minScale = 0.001,
  maxScale = 100
): val is Vector3Tuple {
  if (!Array.isArray(val) || val.length !== 3) {
    return false;
  }
  const [sx, sy, sz] = val;
  if (!isValidNumber(sx) || !isValidNumber(sy) || !isValidNumber(sz)) {
    return false;
  }
  return (
    sx >= minScale &&
    sx <= maxScale &&
    sy >= minScale &&
    sy <= maxScale &&
    sz >= minScale &&
    sz <= maxScale
  );
}
