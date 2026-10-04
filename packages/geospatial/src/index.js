"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EARTH_RADIUS_KM = exports.EARTH_RADIUS_M = void 0;
exports.deg2rad = deg2rad;
exports.rad2deg = rad2deg;
exports.haversineDistance = haversineDistance;
exports.distance = distance;
exports.createPoint = createPoint;
exports.createPolygon = createPolygon;
exports.createCircle = createCircle;
exports.bufferGeometry = bufferGeometry;
exports.pointInPolygon = pointInPolygon;
exports.pointInRadius = pointInRadius;
exports.getBBox = getBBox;
exports.getCentroid = getCentroid;
exports.calculateArea = calculateArea;
exports.bboxFromCenter = bboxFromCenter;
exports.bboxToPolygon = bboxToPolygon;
exports.estimateAffectedPopulation = estimateAffectedPopulation;
exports.getAdminBoundaries = getAdminBoundaries;
exports.generateGridPoints = generateGridPoints;
exports.simplifyGeometry = simplifyGeometry;
exports.getPointsAlongLine = getPointsAlongLine;
exports.findNearestOnLine = findNearestOnLine;
exports.createSector = createSector;
exports.normalizeBearing = normalizeBearing;
exports.midpoint = midpoint;
exports.intersectionArea = intersectionArea;
exports.polygonIoU = polygonIoU;
exports.clusterPoints = clusterPoints;
exports.getClusterCentroid = getClusterCentroid;
exports.mmiToPga = mmiToPga;
exports.pgaToMmi = pgaToMmi;
exports.estimateIntensityAtDistance = estimateIntensityAtDistance;
exports.generateShakeMapGrid = generateShakeMapGrid;
const turf_1 = require("@turf/turf");
/**
 * Earth radius in meters
 */
exports.EARTH_RADIUS_M = 6371000;
exports.EARTH_RADIUS_KM = 6371;
/**
 * Convert degrees to radians
 */
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
/**
 * Convert radians to degrees
 */
function rad2deg(rad) {
    return rad * (180 / Math.PI);
}
/**
 * Haversine distance between two points in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = exports.EARTH_RADIUS_M;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Calculate distance between two GeoJSON points in meters
 */
function distance(pointA, pointB, options) {
    const coordA = 'geometry' in pointA ? pointA.geometry.coordinates : pointA;
    const coordB = 'geometry' in pointB ? pointB.geometry.coordinates : pointB;
    const dist = (0, turf_1.distance)((0, turf_1.feature)((0, turf_1.point)(coordA)), (0, turf_1.feature)((0, turf_1.point)(coordB)), options);
    return options?.units === 'kilometers' ? dist * 1000 : dist;
}
/**
 * Create a point feature
 */
function createPoint(lon, lat, properties) {
    return (0, turf_1.feature)((0, turf_1.point)([lon, lat]), properties);
}
/**
 * Create a polygon feature
 */
function createPolygon(coordinates, properties) {
    return (0, turf_1.feature)((0, turf_1.polygon)(coordinates), properties);
}
/**
 * Create a circle polygon (approximation) from center and radius in meters
 */
function createCircle(center, radiusMeters, steps = 64, properties) {
    const circleFeature = (0, turf_1.circle)(center, radiusMeters / 1000, {
        steps,
        units: 'kilometers'
    });
    return (0, turf_1.feature)(circleFeature.geometry.coordinates, properties);
}
/**
 * Buffer a geometry by distance in meters
 */
function bufferGeometry(geometry, radiusMeters, steps = 64) {
    return (0, turf_1.buffer)(geometry, radiusMeters / 1000, {
        units: 'kilometers',
        steps
    });
}
/**
 * Check if a point is inside a polygon
 */
function pointInPolygon(point, polygon) {
    const pt = 'geometry' in point ? point : (0, turf_1.feature)(point);
    const poly = 'geometry' in polygon ? polygon : (0, turf_1.feature)(polygon);
    return (0, turf_1.booleanPointInPolygon)(pt, poly);
}
/**
 * Check if a point is within a radius of a center point
 */
function pointInRadius(point, center, radiusMeters) {
    const dist = distance(point, center);
    return dist <= radiusMeters;
}
/**
 * Get bounding box of a geometry
 */
function getBBox(geometry) {
    return (0, turf_1.bbox)(geometry);
}
/**
 * Get centroid of a geometry
 */
function getCentroid(geometry) {
    return (0, turf_1.centroid)(geometry);
}
/**
 * Calculate area of a polygon in square meters
 */
function calculateArea(polygon) {
    return (0, turf_1.area)(polygon) * 1_000_000; // Convert km² to m²
}
/**
 * Calculate bounding box from center point and radius
 */
function bboxFromCenter(center, radiusMeters) {
    const radiusKm = radiusMeters / 1000;
    const [lon, lat] = center;
    // Approximate: 1 degree ≈ 111km at equator
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos(deg2rad(lat)));
    return [
        lon - lonDelta,
        lat - latDelta,
        lon + lonDelta,
        lat + latDelta
    ];
}
/**
 * Convert bounds to polygon
 */
function bboxToPolygon(bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    return (0, turf_1.feature)((0, turf_1.polygon)([[
            [minLon, minLat],
            [maxLon, minLat],
            [maxLon, maxLat],
            [minLon, maxLat],
            [minLon, minLat]
        ]]));
}
/**
 * Calculate affected population estimate (rough approximation)
 * Uses population density grid - placeholder for real integration
 */
async function estimateAffectedPopulation(polygon, populationDensity = 400 // people per km² default for India
) {
    const areaKm2 = (0, turf_1.area)(polygon);
    return Math.round(areaKm2 * populationDensity);
}
/**
 * Get administrative boundaries containing a point
 * Placeholder - would integrate with actual boundary data
 */
async function getAdminBoundaries(point, levels) {
    // Placeholder - integrate with actual boundary datasets (Census, GADM, etc.)
    return {};
}
/**
 * Generate grid points within a polygon for sampling
 */
function generateGridPoints(polygon, cellSizeKm = 1) {
    const bbox = getBBox(polygon);
    const [minLon, minLat, maxLon, maxLat] = bbox;
    const points = [];
    const latStep = cellSizeKm / 111;
    const lonStep = cellSizeKm / (111 * Math.cos(deg2rad((minLat + maxLat) / 2)));
    for (let lat = minLat; lat <= maxLat; lat += latStep) {
        for (let lon = minLon; lon <= maxLon; lon += lonStep) {
            const pt = (0, turf_1.feature)((0, turf_1.point)([lon, lat]));
            if ((0, turf_1.booleanPointInPolygon)(pt, (0, turf_1.feature)(polygon))) {
                points.push(pt);
            }
        }
    }
    return (0, turf_1.featureCollection)(points);
}
/**
 * Simplify geometry for display/storage
 */
function simplifyGeometry(geometry, toleranceKm = 0.1, highQuality = false) {
    return (0, turf_1.truncate)(geometry, {
        precision: Math.round(1 / (toleranceKm * 100)), // Convert km to coordinate precision
        coordinates: 2,
        mutate: false
    });
}
/**
 * Get points along a line at regular intervals
 */
function getPointsAlongLine(line, intervalKm) {
    const points = [];
    const lengthKm = (0, turf_1.distance)(line.geometry.coordinates[0], line.geometry.coordinates.slice(-1)[0], { units: 'kilometers' });
    for (let d = 0; d <= lengthKm; d += intervalKm) {
        const pt = (0, turf_1.along)(line, d, { units: 'kilometers' });
        points.push(pt);
    }
    return (0, turf_1.featureCollection)(points);
}
/**
 * Find nearest point on a line from a given point
 */
function findNearestOnLine(line, point) {
    return (0, turf_1.nearestPointOnLine)(line, point);
}
/**
 * Create a sector (pie slice) from center, bearing range, and radius
 */
function createSector(center, startBearing, endBearing, radiusMeters, steps = 32) {
    const points = [center];
    const radiusKm = radiusMeters / 1000;
    const bearingSteps = Math.max(1, Math.floor(steps * Math.abs(endBearing - startBearing) / 360));
    for (let i = 0; i <= bearingSteps; i++) {
        const bearing = startBearing + (endBearing - startBearing) * (i / bearingSteps);
        const dest = (0, turf_1.destination)(center, radiusKm, bearing, { units: 'kilometers' });
        points.push(dest.geometry.coordinates);
    }
    points.push(center); // Close the polygon
    return (0, turf_1.feature)((0, turf_1.polygon)([points]));
}
/**
 * Convert bearing from degrees to standard (0-360)
 */
function normalizeBearing(bearing) {
    return ((bearing % 360) + 360) % 360;
}
/**
 * Calculate midpoint between two points
 */
function midpoint(pointA, pointB) {
    const [lon1, lat1] = pointA;
    const [lon2, lat2] = pointB;
    const lat1Rad = deg2rad(lat1);
    const lat2Rad = deg2rad(lat2);
    const lon1Rad = deg2rad(lon1);
    const lon2Rad = deg2rad(lon2);
    const bx = Math.cos(lat2Rad) * Math.cos(lon2Rad - lon1Rad);
    const by = Math.cos(lat2Rad) * Math.sin(lon2Rad - lon1Rad);
    const lat3Rad = Math.atan2(Math.sin(lat1Rad) + Math.sin(lat2Rad), Math.sqrt((Math.cos(lat1Rad) + bx) ** 2 + by ** 2));
    const lon3Rad = lon1Rad + Math.atan2(by, Math.cos(lat1Rad) + bx);
    return [rad2deg(lon3Rad), rad2deg(lat3Rad)];
}
/**
 * Calculate the intersection area of two polygons
 */
function intersectionArea(polyA, polyB) {
    const result = (0, turf_1.intersect)((0, turf_1.feature)(polyA), (0, turf_1.feature)(polyB));
    if (!result || result.geometry.type !== 'Polygon')
        return 0;
    return calculateArea(result);
}
/**
 * Calculate Jaccard similarity (IoU) of two polygons
 */
function polygonIoU(polyA, polyB) {
    const intersection = intersectionArea(polyA, polyB);
    if (intersection === 0)
        return 0;
    const areaA = calculateArea(polyA);
    const areaB = calculateArea(polyB);
    const union = areaA + areaB - intersection;
    return intersection / union;
}
/**
 * Cluster nearby points using simple distance-based clustering
 */
function clusterPoints(points, maxDistanceMeters = 1000) {
    const clusters = [];
    const unassigned = [...points];
    while (unassigned.length > 0) {
        const seed = unassigned.shift();
        const cluster = [seed];
        for (let i = unassigned.length - 1; i >= 0; i--) {
            if (distance(seed, unassigned[i]) <= maxDistanceMeters) {
                cluster.push(unassigned.splice(i, 1)[0]);
            }
        }
        clusters.push(cluster);
    }
    return clusters;
}
/**
 * Get representative point for a cluster (centroid)
 */
function getClusterCentroid(cluster) {
    if (cluster.length === 1)
        return cluster[0];
    const coords = cluster.map(p => p.geometry.coordinates);
    const centroid = (0, turf_1.feature)((0, turf_1.point)([
        coords.reduce((sum, c) => sum + c[0], 0) / coords.length,
        coords.reduce((sum, c) => sum + c[1], 0) / coords.length
    ]));
    return centroid;
}
/**
 * Convert MMI intensity to approximate PGA (Peak Ground Acceleration)
 */
function mmiToPga(mmi) {
    // Wald et al. (1999) approximate conversion
    // PGA in %g
    return Math.exp((mmi - 1.78) / 1.55) / 100 * 9.81;
}
/**
 * Convert PGA to MMI intensity
 */
function pgaToMmi(pga) {
    // PGA in m/s²
    return 1.78 + 1.55 * Math.log(pga / 9.81 * 100);
}
/**
 * Estimate intensity at distance from earthquake
 * Using Atkinson & Wald (2007) GMPE approximation
 */
function estimateIntensityAtDistance(magnitude, distanceKm, depthKm = 10) {
    // Simplified GMPE - replace with proper model
    const R = Math.sqrt(distanceKm ** 2 + depthKm ** 2);
    const pga = 10 ** (0.5 * magnitude - 1.5 * Math.log10(R) - 2.5); // Very rough
    return pgaToMmi(pga);
}
/**
 * Generate shake map grid for an earthquake
 */
function generateShakeMapGrid(epicenter, magnitude, depthKm, radiusKm = 200, gridSpacingKm = 5) {
    const epicenterFeature = (0, turf_1.feature)((0, turf_1.point)(epicenter));
    const bbox = bboxFromCenter(epicenter, radiusKm * 1000);
    const polygon = bboxToPolygon(bbox);
    const grid = generateGridPoints(polygon, gridSpacingKm);
    return (0, turf_1.featureCollection)(grid.features.map(pt => {
        const coords = pt.geometry.coordinates;
        const dist = distance(epicenterFeature, pt);
        const intensity = estimateIntensityAtDistance(magnitude, dist / 1000, depthKm);
        return (0, turf_1.feature)((0, turf_1.point)(coords), {
            intensity: Math.round(intensity * 10) / 10,
            pga: Math.round(mmiToPga(intensity) * 1000) / 1000,
            distanceKm: Math.round(dist / 1000 * 10) / 10,
        });
    }));
}
exports.default = {
    haversineDistance,
    distance,
    createPoint,
    createPolygon,
    createCircle,
    bufferGeometry,
    pointInPolygon,
    pointInRadius,
    getBBox,
    getCentroid,
    calculateArea,
    bboxFromCenter,
    bboxToPolygon,
    estimateAffectedPopulation,
    getAdminBoundaries,
    generateGridPoints,
    simplifyGeometry,
    getPointsAlongLine,
    findNearestOnLine,
    createSector,
    normalizeBearing,
    midpoint,
    intersectionArea,
    polygonIoU,
    clusterPoints,
    getClusterCentroid,
    mmiToPga,
    pgaToMmi,
    estimateIntensityAtDistance,
    generateShakeMapGrid,
};
//# sourceMappingURL=index.js.map