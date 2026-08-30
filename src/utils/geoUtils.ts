import { GeoCoordinate } from '../types';

export const EARTH_RADIUS_KM = 6371.0;
export const KM_TO_NM = 0.539957;

/**
 * Calculates Great Circle distance using the Haversine formula
 */
export function calculateHaversineDistanceKm(c1: GeoCoordinate, c2: GeoCoordinate): number {
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lon - c1.lon) * Math.PI) / 180;
  const lat1 = (c1.lat * Math.PI) / 180;
  const lat2 = (c2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function kmToNauticalMiles(km: number): number {
  return km * KM_TO_NM;
}

/**
 * Calculates initial bearing from point 1 to point 2 (0 - 360 deg)
 */
export function calculateBearingDeg(start: GeoCoordinate, dest: GeoCoordinate): number {
  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (dest.lat * Math.PI) / 180;
  const dLon = ((dest.lon - start.lon) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Destination coordinate given start, distance in km, and bearing in degrees
 */
export function calculateDestinationPoint(
  start: GeoCoordinate,
  distanceKm: number,
  bearingDeg: number
): GeoCoordinate {
  const δ = distanceKm / EARTH_RADIUS_KM; // angular distance in radians
  const θ = (bearingDeg * Math.PI) / 180;

  const φ1 = (start.lat * Math.PI) / 180;
  const λ1 = (start.lon * Math.PI) / 180;

  const sinφ2 = Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);

  const y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1);
  const x = Math.cos(δ) - Math.sin(φ1) * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);

  const lat = (φ2 * 180) / Math.PI;
  let lon = (λ2 * 180) / Math.PI;
  // Normalize lon to -180 .. 180
  lon = ((lon + 540) % 360) - 180;

  return { lat, lon };
}

/**
 * Interpolates intermediate points between start and destination
 */
export function interpolateGreatCirclePoints(
  start: GeoCoordinate,
  dest: GeoCoordinate,
  numSegments: number = 20
): GeoCoordinate[] {
  const points: GeoCoordinate[] = [];
  const totalDist = calculateHaversineDistanceKm(start, dest);
  if (totalDist < 1) return [start, dest];

  const initialBearing = calculateBearingDeg(start, dest);

  for (let i = 0; i <= numSegments; i++) {
    const fraction = i / numSegments;
    const currentDist = totalDist * fraction;
    // For realistic polar curvature, calculate waypoint with intermediate geodesic
    const pt = calculateDestinationPoint(start, currentDist, initialBearing);
    points.push(pt);
  }
  return points;
}

/**
 * Projects a Lat/Lon to South Polar Stereographic 2D plane (centered on South Pole -90°, 0°)
 * Returns normalized screen coordinates [x, y] in [0, width], [0, height]
 * Center is South Pole (90°S), Outer boundary is e.g. 50°S (or customizable)
 */
export function projectSouthPolarStereographic(
  coord: GeoCoordinate,
  centerX: number,
  centerY: number,
  radiusPx: number,
  outerLatitudeLimit: number = -50.0
): { x: number; y: number; isVisible: boolean } {
  // Clamped latitude: south pole is -90, equator is 0
  const lat = Math.max(-90, Math.min(outerLatitudeLimit, coord.lat));
  const lonRad = ((coord.lon - 90) * Math.PI) / 180; // Align 0° longitude to bottom/standard polar orientation

  // Stereographic radial distance formula:
  // r = 2 * R * tan((90 - |lat|) / 2)
  // Normalized between -90° (r=0) and outerLatitudeLimit (r=radiusPx)
  const colatitudeDeg = 90 + coord.lat; // 0 at South Pole (-90), 40 at -50°S
  const maxColatitudeDeg = 90 + outerLatitudeLimit; // e.g. 40°

  if (colatitudeDeg > maxColatitudeDeg) {
    // Beyond outer latitude limit, clamp to perimeter with indicator
    const r = radiusPx * 1.05;
    const x = centerX + r * Math.cos(lonRad);
    const y = centerY + r * Math.sin(lonRad);
    return { x, y, isVisible: false };
  }

  const r = (colatitudeDeg / maxColatitudeDeg) * radiusPx;
  const x = centerX + r * Math.cos(lonRad);
  const y = centerY + r * Math.sin(lonRad);

  return { x, y, isVisible: true };
}

/**
 * Inverse projection from Screen X, Y back to GeoCoordinate (Lat, Lon)
 */
export function unprojectSouthPolarStereographic(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusPx: number,
  outerLatitudeLimit: number = -50.0
): GeoCoordinate {
  const dx = x - centerX;
  const dy = y - centerY;
  const r = Math.sqrt(dx * dx + dy * dy);
  const maxColatitudeDeg = 90 + outerLatitudeLimit;

  const colatitudeDeg = (r / radiusPx) * maxColatitudeDeg;
  const lat = Math.max(-90, Math.min(0, colatitudeDeg - 90));

  let angleRad = Math.atan2(dy, dx);
  let lonDeg = (angleRad * 180) / Math.PI + 90;
  // Normalize lon to -180 .. 180
  lonDeg = ((lonDeg + 540) % 360) - 180;

  return { lat, lon: lonDeg };
}

/**
 * Closest Point of Approach (CPA) calculation between a route and a point (e.g. iceberg)
 */
export function calculatePointToRouteMinDistanceKm(
  point: GeoCoordinate,
  routeWaypoints: GeoCoordinate[]
): { minDistanceKm: number; nearestWaypointIndex: number } {
  if (routeWaypoints.length === 0) return { minDistanceKm: 9999, nearestWaypointIndex: 0 };
  let minDistanceKm = Infinity;
  let nearestWaypointIndex = 0;

  for (let i = 0; i < routeWaypoints.length; i++) {
    const d = calculateHaversineDistanceKm(point, routeWaypoints[i]);
    if (d < minDistanceKm) {
      minDistanceKm = d;
      nearestWaypointIndex = i;
    }
  }

  return { minDistanceKm, nearestWaypointIndex };
}

/**
 * Formats coordinates for scientific display: e.g. "69°24'S, 076°11'E"
 */
export function formatPolarCoordinates(coord: GeoCoordinate): string {
  const latAbs = Math.abs(coord.lat);
  const latDeg = Math.floor(latAbs);
  const latMin = Math.round((latAbs - latDeg) * 60);
  const latDir = coord.lat >= 0 ? 'N' : 'S';

  const lonAbs = Math.abs(coord.lon);
  const lonDeg = Math.floor(lonAbs);
  const lonMin = Math.round((lonAbs - lonDeg) * 60);
  const lonDir = coord.lon >= 0 ? 'E' : 'W';

  return `${latDeg}°${latMin.toString().padStart(2, '0')}'${latDir}, ${lonDeg.toString().padStart(3, '0')}°${lonMin.toString().padStart(2, '0')}'${lonDir}`;
}
