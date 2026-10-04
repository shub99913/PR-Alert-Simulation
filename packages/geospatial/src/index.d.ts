import type { Point, Polygon, MultiPolygon, Feature, FeatureCollection, Geometry, GeoJsonProperties, BBox, Position } from '@turf/turf';
/**
 * Earth radius in meters
 */
export declare const EARTH_RADIUS_M = 6371000;
export declare const EARTH_RADIUS_KM = 6371;
/**
 * Convert degrees to radians
 */
export declare function deg2rad(deg: number): number;
/**
 * Convert radians to degrees
 */
export declare function rad2deg(rad: number): number;
/**
 * Haversine distance between two points in meters
 */
export declare function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
/**
 * Calculate distance between two GeoJSON points in meters
 */
export declare function distance(pointA: Feature<Point> | Position, pointB: Feature<Point> | Position, options?: {
    units?: 'meters' | 'kilometers' | 'miles' | 'degrees';
}): number;
/**
 * Create a point feature
 */
export declare function createPoint(lon: number, lat: number, properties?: GeoJsonProperties): Feature<Point>;
/**
 * Create a polygon feature
 */
export declare function createPolygon(coordinates: Position[][][], properties?: GeoJsonProperties): Feature<Polygon>;
/**
 * Create a circle polygon (approximation) from center and radius in meters
 */
export declare function createCircle(center: Position, radiusMeters: number, steps?: number, properties?: GeoJsonProperties): Feature<Polygon>;
/**
 * Buffer a geometry by distance in meters
 */
export declare function bufferGeometry(geometry: Feature<any> | Geometry, radiusMeters: number, steps?: number): Feature<Polygon | MultiPolygon>;
/**
 * Check if a point is inside a polygon
 */
export declare function pointInPolygon(point: Feature<Point> | Position, polygon: Feature<Polygon | MultiPolygon> | Polygon | MultiPolygon): boolean;
/**
 * Check if a point is within a radius of a center point
 */
export declare function pointInRadius(point: Feature<Point> | Position, center: Feature<Point> | Position, radiusMeters: number): boolean;
/**
 * Get bounding box of a geometry
 */
export declare function getBBox(geometry: Feature<any> | Geometry): BBox;
/**
 * Get centroid of a geometry
 */
export declare function getCentroid(geometry: Feature<any> | Geometry): Feature<Point>;
/**
 * Calculate area of a polygon in square meters
 */
export declare function calculateArea(polygon: Feature<Polygon | MultiPolygon> | Polygon | MultiPolygon): number;
/**
 * Calculate bounding box from center point and radius
 */
export declare function bboxFromCenter(center: Position, radiusMeters: number): BBox;
/**
 * Convert bounds to polygon
 */
export declare function bboxToPolygon(bbox: BBox): Feature<Polygon>;
/**
 * Calculate affected population estimate (rough approximation)
 * Uses population density grid - placeholder for real integration
 */
export declare function estimateAffectedPopulation(polygon: Feature<Polygon | MultiPolygon>, populationDensity?: number): Promise<number>;
/**
 * Get administrative boundaries containing a point
 * Placeholder - would integrate with actual boundary data
 */
export declare function getAdminBoundaries(point: Feature<Point> | Position, levels: ('country' | 'state' | 'district' | 'tehsil')[]): Promise<Record<string, Feature<Polygon>>>;
/**
 * Generate grid points within a polygon for sampling
 */
export declare function generateGridPoints(polygon: Feature<Polygon>, cellSizeKm?: number): FeatureCollection<Point>;
/**
 * Simplify geometry for display/storage
 */
export declare function simplifyGeometry(geometry: Feature<any> | Geometry, toleranceKm?: number, highQuality?: boolean): Feature<any>;
/**
 * Get points along a line at regular intervals
 */
export declare function getPointsAlongLine(line: Feature<LineString>, intervalKm: number): FeatureCollection<Point>;
/**
 * Find nearest point on a line from a given point
 */
export declare function findNearestOnLine(line: Feature<LineString>, point: Feature<Point> | Position): Feature<Point>;
/**
 * Create a sector (pie slice) from center, bearing range, and radius
 */
export declare function createSector(center: Position, startBearing: number, endBearing: number, radiusMeters: number, steps?: number): Feature<Polygon>;
/**
 * Convert bearing from degrees to standard (0-360)
 */
export declare function normalizeBearing(bearing: number): number;
/**
 * Calculate midpoint between two points
 */
export declare function midpoint(pointA: Position, pointB: Position): Position;
/**
 * Calculate the intersection area of two polygons
 */
export declare function intersectionArea(polyA: Feature<Polygon> | Polygon, polyB: Feature<Polygon> | Polygon): number;
/**
 * Calculate Jaccard similarity (IoU) of two polygons
 */
export declare function polygonIoU(polyA: Feature<Polygon> | Polygon, polyB: Feature<Polygon> | Polygon): number;
/**
 * Cluster nearby points using simple distance-based clustering
 */
export declare function clusterPoints(points: Feature<Point>[], maxDistanceMeters?: number): Feature<Point>[][];
/**
 * Get representative point for a cluster (centroid)
 */
export declare function getClusterCentroid(cluster: Feature<Point>[]): Feature<Point>;
/**
 * Convert MMI intensity to approximate PGA (Peak Ground Acceleration)
 */
export declare function mmiToPga(mmi: number): number;
/**
 * Convert PGA to MMI intensity
 */
export declare function pgaToMmi(pga: number): number;
/**
 * Estimate intensity at distance from earthquake
 * Using Atkinson & Wald (2007) GMPE approximation
 */
export declare function estimateIntensityAtDistance(magnitude: number, distanceKm: number, depthKm?: number): number;
/**
 * Generate shake map grid for an earthquake
 */
export declare function generateShakeMapGrid(epicenter: Position, magnitude: number, depthKm: number, radiusKm?: number, gridSpacingKm?: number): FeatureCollection<Point>;
declare const _default: {
    haversineDistance: typeof haversineDistance;
    distance: typeof distance;
    createPoint: typeof createPoint;
    createPolygon: typeof createPolygon;
    createCircle: typeof createCircle;
    bufferGeometry: typeof bufferGeometry;
    pointInPolygon: typeof pointInPolygon;
    pointInRadius: typeof pointInRadius;
    getBBox: typeof getBBox;
    getCentroid: typeof getCentroid;
    calculateArea: typeof calculateArea;
    bboxFromCenter: typeof bboxFromCenter;
    bboxToPolygon: typeof bboxToPolygon;
    estimateAffectedPopulation: typeof estimateAffectedPopulation;
    getAdminBoundaries: typeof getAdminBoundaries;
    generateGridPoints: typeof generateGridPoints;
    simplifyGeometry: typeof simplifyGeometry;
    getPointsAlongLine: typeof getPointsAlongLine;
    findNearestOnLine: typeof findNearestOnLine;
    createSector: typeof createSector;
    normalizeBearing: typeof normalizeBearing;
    midpoint: typeof midpoint;
    intersectionArea: typeof intersectionArea;
    polygonIoU: typeof polygonIoU;
    clusterPoints: typeof clusterPoints;
    getClusterCentroid: typeof getClusterCentroid;
    mmiToPga: typeof mmiToPga;
    pgaToMmi: typeof pgaToMmi;
    estimateIntensityAtDistance: typeof estimateIntensityAtDistance;
    generateShakeMapGrid: typeof generateShakeMapGrid;
};
export default _default;
//# sourceMappingURL=index.d.ts.map