"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schemas = exports.WSEventSchema = exports.ApiResponseSchema = exports.PaginatedResponseSchema = exports.CapAlertSchema = exports.DispatchRecordSchema = exports.UserSchema = exports.CrowdReportSchema = exports.AlertSchema = exports.DisasterEventSchema = exports.SourceTypeSchema = exports.ChannelSchema = exports.AlertStatusSchema = exports.SeveritySchema = exports.DisasterTypeSchema = exports.FeatureCollectionSchema = exports.FeatureSchema = exports.GeoJsonPropertiesSchema = exports.GeometrySchema = exports.MultiPolygonSchema = exports.PolygonSchema = exports.PointSchema = exports.PositionSchema = void 0;
const zod_1 = require("zod");
/**
 * Base GeoJSON types
 */
exports.PositionSchema = zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]); // [lon, lat]
exports.PointSchema = zod_1.z.object({
    type: zod_1.z.literal('Point'),
    coordinates: exports.PositionSchema,
});
exports.PolygonSchema = zod_1.z.object({
    type: zod_1.z.literal('Polygon'),
    coordinates: zod_1.z.array(zod_1.z.array(zod_1.z.array(zod_1.z.number()))),
});
exports.MultiPolygonSchema = zod_1.z.object({
    type: zod_1.z.literal('MultiPolygon'),
    coordinates: zod_1.z.array(zod_1.z.array(zod_1.z.array(zod_1.z.array(zod_1.z.number())))),
});
exports.GeometrySchema = zod_1.z.union([exports.PointSchema, exports.PolygonSchema, exports.MultiPolygonSchema]);
exports.GeoJsonPropertiesSchema = zod_1.z.record(zod_1.z.unknown());
exports.FeatureSchema = zod_1.z.object({
    type: zod_1.z.literal('Feature'),
    geometry: exports.GeometrySchema,
    properties: exports.GeoJsonPropertiesSchema.optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
});
exports.FeatureCollectionSchema = zod_1.z.object({
    type: zod_1.z.literal('FeatureCollection'),
    features: zod_1.z.array(exports.FeatureSchema),
    bbox: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number(), zod_1.z.number(), zod_1.z.number()]).optional(),
});
/**
 * Disaster event types
 */
exports.DisasterTypeSchema = zod_1.z.enum([
    'earthquake',
    'flood',
    'cyclone',
    'wildfire',
    'landslide',
    'heatwave',
    'tsunami',
    'air_quality',
    'volcano',
    'storm_surge',
    'drought',
    'cold_wave',
    'thunderstorm',
    'hail',
    'tornado',
    'avalanche',
]);
/**
 * Severity levels
 */
exports.SeveritySchema = zod_1.z.enum([
    'info',
    'warning',
    'alert',
    'emergency',
]);
/**
 * Alert status
 */
exports.AlertStatusSchema = zod_1.z.enum([
    'draft',
    'issued',
    'cancelled',
    'expired',
]);
/**
 * Dispatch channels
 */
exports.ChannelSchema = zod_1.z.enum([
    'sms',
    'email',
    'push',
    'whatsapp',
    'webhook',
    'social_media',
    'siren',
    'cell_broadcast',
    'radio',
    'tv',
    'operator_dashboard',
]);
/**
 * Source types
 */
exports.SourceTypeSchema = zod_1.z.enum([
    'usgs',
    'imd',
    'gdacs',
    'firms',
    'openaq',
    'openweather',
    'crowd',
    'social_media',
    'operator',
    'satellite',
]);
/**
 * Core Event Schema - Normalized disaster event
 */
exports.DisasterEventSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(), // MongoDB ObjectId as string
    source: exports.SourceTypeSchema,
    sourceId: zod_1.z.string(), // Unique ID from source
    disasterType: exports.DisasterTypeSchema,
    severity: exports.SeveritySchema,
    confidence: zod_1.z.number().min(0).max(1),
    // Location - GeoJSON Point
    location: exports.PointSchema,
    // Optional affected area polygon
    area: exports.PolygonSchema.optional(),
    // Event properties (flexible)
    properties: zod_1.z.record(zod_1.z.unknown()).default({}),
    // Timestamps
    timestamp: zod_1.z.string().datetime(), // Event occurrence time
    receivedAt: zod_1.z.string().datetime(), // When we received it
    processedAt: zod_1.z.string().datetime().optional(),
    // Processing metadata
    processingVersion: zod_1.z.string().optional(),
    rawData: zod_1.z.unknown().optional(), // Original source data for debugging
    // Deduplication
    deduplicationKey: zod_1.z.string().optional(),
    // For crowd reports
    reporterId: zod_1.z.string().optional(),
    reporterTrustScore: zod_1.z.number().min(0).max(1).optional(),
});
/**
 * Alert Schema
 */
exports.AlertSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    eventIds: zod_1.z.array(zod_1.z.string()).min(1),
    disasterType: exports.DisasterTypeSchema,
    severity: exports.SeveritySchema,
    confidence: zod_1.z.number().min(0).max(1),
    // Alert location (epicenter/center)
    location: exports.PointSchema,
    // Affected area polygon
    affectedArea: exports.PolygonSchema.optional(),
    affectedPopulation: zod_1.z.number().int().nonnegative().optional(),
    // Messages per language and channel
    messages: zod_1.z.array(zod_1.z.object({
        lang: zod_1.z.string().min(2).max(5),
        channel: zod_1.z.string(),
        content: zod_1.z.string(),
        templateId: zod_1.z.string().optional(),
    })).min(1),
    // CAP XML
    capXml: zod_1.z.string(),
    // Status
    status: exports.AlertStatusSchema.default('draft'),
    // Timestamps
    issuedAt: zod_1.z.string().datetime().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    cancelledAt: zod_1.z.string().datetime().optional(),
    createdAt: zod_1.z.string().datetime().default(() => new Date().toISOString()),
    updatedAt: zod_1.z.string().datetime().default(() => new Date().toISOString()),
    // Dispatch tracking
    dispatches: zod_1.z.array(zod_1.z.object({
        channel: zod_1.z.string(),
        recipient: zod_1.z.string(),
        status: zod_1.z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced']),
        sentAt: zod_1.z.string().datetime().optional(),
        deliveredAt: zod_1.z.string().datetime().optional(),
        error: zod_1.z.string().optional(),
        providerResponse: zod_1.z.unknown().optional(),
    })).default([]),
    // Audit
    issuedBy: zod_1.z.string().optional(), // system | operator_id
    cancelReason: zod_1.z.string().optional(),
    relatedAlerts: zod_1.z.array(zod_1.z.string()).default([]),
});
/**
 * Crowd Report Schema
 */
exports.CrowdReportSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    anonymous: zod_1.z.boolean().default(false),
    disasterType: exports.DisasterTypeSchema,
    severity: zod_1.z.enum(['info', 'minor', 'moderate', 'severe', 'critical']),
    location: exports.PointSchema,
    description: zod_1.z.string().min(10).max(5000),
    media: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['photo', 'video', 'audio']),
        url: zod_1.z.string().url(),
        thumbnailUrl: zod_1.z.string().url().optional(),
        mimeType: zod_1.z.string(),
        size: zod_1.z.number().int().positive(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })).max(5).default([]),
    timestamp: zod_1.z.string().datetime().default(() => new Date().toISOString()),
    status: zod_1.z.enum(['pending', 'verified', 'rejected', 'escalated']).default('pending'),
    verification: zod_1.z.object({
        verified: zod_1.z.boolean().default(false),
        verifiedBy: zod_1.z.string().optional(),
        verifiedAt: zod_1.z.string().datetime().optional(),
        voteCount: zod_1.z.number().int().default(0),
        agreeVotes: zod_1.z.number().int().default(0),
        disagreeVotes: zod_1.z.number().int().default(0),
        trustScore: zod_1.z.number().min(0).max(1).optional(),
    }).default({}),
    contactInfo: zod_1.z.string().optional(),
    clusterId: zod_1.z.string().optional(),
});
/**
 * User Schema
 */
exports.UserSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    phone: zod_1.z.string().regex(/^\+[1-9]\d{1,14}$/).optional(), // E.164
    email: zod_1.z.string().email().optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    language: zod_1.z.string().min(2).max(5).default('en'),
    location: exports.PointSchema.optional(),
    preferences: zod_1.z.object({
        minSeverity: zod_1.z.enum(['info', 'warning', 'alert', 'emergency']).default('warning'),
        channels: zod_1.z.array(exports.ChannelSchema).default(['push', 'sms']),
        quietHours: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            start: zod_1.z.string().regex(/^\d{2}:\d{2}$/).default('22:00'),
            end: zod_1.z.string().regex(/^\d{2}:\d{2}$/).default('07:00'),
            timezone: zod_1.z.string().default('Asia/Kolkata'),
        }).default({}),
        autoExpandArea: zod_1.z.boolean().default(true),
        expansionRadiusKm: zod_1.z.number().int().positive().default(50),
        disasterTypes: zod_1.z.array(exports.DisasterTypeSchema).default([]), // empty = all
    }).default({}),
    active: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.string().datetime().default(() => new Date().toISOString()),
    lastActiveAt: zod_1.z.string().datetime().optional(),
    pushTokens: zod_1.z.array(zod_1.z.object({
        token: zod_1.z.string(),
        platform: zod_1.z.enum(['ios', 'android', 'web']),
        updatedAt: zod_1.z.string().datetime(),
    })).default([]),
    trustScore: zod_1.z.number().min(0).max(100).default(50),
    roles: zod_1.z.array(zod_1.z.enum(['user', 'operator', 'admin', 'verifier'])).default(['user']),
});
/**
 * Dispatch Record
 */
exports.DispatchRecordSchema = zod_1.z.object({
    channel: exports.ChannelSchema,
    recipient: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced', 'rejected']),
    sentAt: zod_1.z.string().datetime().optional(),
    deliveredAt: zod_1.z.string().datetime().optional(),
    failedAt: zod_1.z.string().datetime().optional(),
    error: zod_1.z.string().optional(),
    providerResponse: zod_1.z.unknown().optional(),
    retryCount: zod_1.z.number().int().default(0),
    cost: zod_1.z.number().optional(),
});
/**
 * CAP Alert Schema (simplified for validation)
 */
exports.CapAlertSchema = zod_1.z.object({
    identifier: zod_1.z.string(),
    sender: zod_1.z.string().email(),
    sent: zod_1.z.string().datetime(),
    status: zod_1.z.enum(['Actual', 'Exercise', 'Test', 'Draft']),
    msgType: zod_1.z.enum(['Alert', 'Update', 'Cancel', 'Ack', 'Error']),
    scope: zod_1.z.enum(['Public', 'Restricted', 'Private']),
    info: zod_1.z.array(zod_1.z.object({
        language: zod_1.z.string().min(2).max(5),
        category: zod_1.z.enum(['Geo', 'Met', 'Safety', 'Security', 'Rescue', 'Fire', 'Health', 'Env', 'Transport', 'Infra', 'CBRNE', 'Other']),
        event: zod_1.z.string(),
        urgency: zod_1.z.enum(['Immediate', 'Expected', 'Future', 'Past', 'Unknown']),
        severity: zod_1.z.enum(['Extreme', 'Severe', 'Moderate', 'Minor', 'Unknown']),
        certainty: zod_1.z.enum(['Observed', 'Likely', 'Possible', 'Unlikely', 'Unknown']),
        effective: zod_1.z.string().datetime().optional(),
        onset: zod_1.z.string().datetime().optional(),
        expires: zod_1.z.string().datetime().optional(),
        senderName: zod_1.z.string().optional(),
        headline: zod_1.z.string().max(160).optional(),
        description: zod_1.z.string().optional(),
        instruction: zod_1.z.string().optional(),
        contact: zod_1.z.string().optional(),
        area: zod_1.z.array(zod_1.z.object({
            areaDesc: zod_1.z.string(),
            polygon: zod_1.z.array(zod_1.z.number()).optional(),
            circle: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number(), zod_1.z.number()]).optional(),
            geocode: zod_1.z.array(zod_1.z.object({
                valueName: zod_1.z.string(),
                value: zod_1.z.string(),
            })).optional(),
        })).optional(),
        parameter: zod_1.z.array(zod_1.z.object({
            valueName: zod_1.z.string(),
            value: zod_1.z.string(),
        })).optional(),
    })).min(1),
});
/**
 * API Response Schemas
 */
const PaginatedResponseSchema = (itemSchema) => zod_1.z.object({
    data: zod_1.z.array(itemSchema),
    pagination: zod_1.z.object({
        page: zod_1.z.number().int().positive(),
        limit: zod_1.z.number().int().positive(),
        total: zod_1.z.number().int().nonnegative(),
        totalPages: zod_1.z.number().int().nonnegative(),
    }),
    timestamp: zod_1.z.string().datetime(),
});
exports.PaginatedResponseSchema = PaginatedResponseSchema;
const ApiResponseSchema = (itemSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: itemSchema.optional(),
    error: zod_1.z.object({
        code: zod_1.z.string(),
        message: zod_1.z.string(),
        details: zod_1.z.unknown().optional(),
    }).optional(),
    timestamp: zod_1.z.string().datetime(),
});
exports.ApiResponseSchema = ApiResponseSchema;
/**
 * WebSocket Event Schemas
 */
exports.WSEventSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'event:new',
        'event:update',
        'alert:issued',
        'alert:cancelled',
        'alert:expired',
        'crowd_report:new',
        'crowd_report:verified',
        'user:location_update',
        'system:status',
    ]),
    payload: zod_1.z.unknown(),
    timestamp: zod_1.z.string().datetime(),
});
/**
 * Export all schemas
 */
exports.Schemas = {
    Position: exports.PositionSchema,
    Point: exports.PointSchema,
    Polygon: exports.PolygonSchema,
    MultiPolygon: exports.MultiPolygonSchema,
    Geometry: exports.GeometrySchema,
    Feature: exports.FeatureSchema,
    FeatureCollection: exports.FeatureCollectionSchema,
    DisasterType: exports.DisasterTypeSchema,
    Severity: exports.SeveritySchema,
    AlertStatus: exports.AlertStatusSchema,
    Channel: exports.ChannelSchema,
    SourceType: exports.SourceTypeSchema,
    DisasterEvent: exports.DisasterEventSchema,
    Alert: exports.AlertSchema,
    CrowdReport: exports.CrowdReportSchema,
    User: exports.UserSchema,
    DispatchRecord: exports.DispatchRecordSchema,
    CapAlert: exports.CapAlertSchema,
    WSEvent: exports.WSEventSchema,
};
//# sourceMappingURL=index.js.map