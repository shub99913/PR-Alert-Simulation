import { z } from 'zod';
/**
 * Base GeoJSON types
 */
export declare const PositionSchema: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
export declare const PointSchema: z.ZodObject<{
    type: z.ZodLiteral<"Point">;
    coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
}, "strip", z.ZodTypeAny, {
    type: "Point";
    coordinates: [number, number];
}, {
    type: "Point";
    coordinates: [number, number];
}>;
export declare const PolygonSchema: z.ZodObject<{
    type: z.ZodLiteral<"Polygon">;
    coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
}, "strip", z.ZodTypeAny, {
    type: "Polygon";
    coordinates: number[][][];
}, {
    type: "Polygon";
    coordinates: number[][][];
}>;
export declare const MultiPolygonSchema: z.ZodObject<{
    type: z.ZodLiteral<"MultiPolygon">;
    coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
}, "strip", z.ZodTypeAny, {
    type: "MultiPolygon";
    coordinates: number[][][][];
}, {
    type: "MultiPolygon";
    coordinates: number[][][][];
}>;
export declare const GeometrySchema: z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"Point">;
    coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
}, "strip", z.ZodTypeAny, {
    type: "Point";
    coordinates: [number, number];
}, {
    type: "Point";
    coordinates: [number, number];
}>, z.ZodObject<{
    type: z.ZodLiteral<"Polygon">;
    coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
}, "strip", z.ZodTypeAny, {
    type: "Polygon";
    coordinates: number[][][];
}, {
    type: "Polygon";
    coordinates: number[][][];
}>, z.ZodObject<{
    type: z.ZodLiteral<"MultiPolygon">;
    coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
}, "strip", z.ZodTypeAny, {
    type: "MultiPolygon";
    coordinates: number[][][][];
}, {
    type: "MultiPolygon";
    coordinates: number[][][][];
}>]>;
export declare const GeoJsonPropertiesSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const FeatureSchema: z.ZodObject<{
    type: z.ZodLiteral<"Feature">;
    geometry: z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"Polygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "Polygon";
        coordinates: number[][][];
    }, {
        type: "Polygon";
        coordinates: number[][][];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"MultiPolygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "MultiPolygon";
        coordinates: number[][][][];
    }, {
        type: "MultiPolygon";
        coordinates: number[][][][];
    }>]>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strip", z.ZodTypeAny, {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number];
    } | {
        type: "Polygon";
        coordinates: number[][][];
    } | {
        type: "MultiPolygon";
        coordinates: number[][][][];
    };
    properties?: Record<string, unknown> | undefined;
    id?: string | number | undefined;
}, {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number];
    } | {
        type: "Polygon";
        coordinates: number[][][];
    } | {
        type: "MultiPolygon";
        coordinates: number[][][][];
    };
    properties?: Record<string, unknown> | undefined;
    id?: string | number | undefined;
}>;
export declare const FeatureCollectionSchema: z.ZodObject<{
    type: z.ZodLiteral<"FeatureCollection">;
    features: z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"Feature">;
        geometry: z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            type: "Point";
            coordinates: [number, number];
        }, {
            type: "Point";
            coordinates: [number, number];
        }>, z.ZodObject<{
            type: z.ZodLiteral<"Polygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "Polygon";
            coordinates: number[][][];
        }, {
            type: "Polygon";
            coordinates: number[][][];
        }>, z.ZodObject<{
            type: z.ZodLiteral<"MultiPolygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "MultiPolygon";
            coordinates: number[][][][];
        }, {
            type: "MultiPolygon";
            coordinates: number[][][][];
        }>]>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    }, "strip", z.ZodTypeAny, {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        } | {
            type: "Polygon";
            coordinates: number[][][];
        } | {
            type: "MultiPolygon";
            coordinates: number[][][][];
        };
        properties?: Record<string, unknown> | undefined;
        id?: string | number | undefined;
    }, {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        } | {
            type: "Polygon";
            coordinates: number[][][];
        } | {
            type: "MultiPolygon";
            coordinates: number[][][][];
        };
        properties?: Record<string, unknown> | undefined;
        id?: string | number | undefined;
    }>, "many">;
    bbox: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
}, "strip", z.ZodTypeAny, {
    type: "FeatureCollection";
    features: {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        } | {
            type: "Polygon";
            coordinates: number[][][];
        } | {
            type: "MultiPolygon";
            coordinates: number[][][][];
        };
        properties?: Record<string, unknown> | undefined;
        id?: string | number | undefined;
    }[];
    bbox?: [number, number, number, number] | undefined;
}, {
    type: "FeatureCollection";
    features: {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        } | {
            type: "Polygon";
            coordinates: number[][][];
        } | {
            type: "MultiPolygon";
            coordinates: number[][][][];
        };
        properties?: Record<string, unknown> | undefined;
        id?: string | number | undefined;
    }[];
    bbox?: [number, number, number, number] | undefined;
}>;
/**
 * Disaster event types
 */
export declare const DisasterTypeSchema: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
export type DisasterType = z.infer<typeof DisasterTypeSchema>;
/**
 * Severity levels
 */
export declare const SeveritySchema: z.ZodEnum<["info", "warning", "alert", "emergency"]>;
export type Severity = z.infer<typeof SeveritySchema>;
/**
 * Alert status
 */
export declare const AlertStatusSchema: z.ZodEnum<["draft", "issued", "cancelled", "expired"]>;
export type AlertStatus = z.infer<typeof AlertStatusSchema>;
/**
 * Dispatch channels
 */
export declare const ChannelSchema: z.ZodEnum<["sms", "email", "push", "whatsapp", "webhook", "social_media", "siren", "cell_broadcast", "radio", "tv", "operator_dashboard"]>;
export type Channel = z.infer<typeof ChannelSchema>;
/**
 * Source types
 */
export declare const SourceTypeSchema: z.ZodEnum<["usgs", "imd", "gdacs", "firms", "openaq", "openweather", "crowd", "social_media", "operator", "satellite"]>;
export type SourceType = z.infer<typeof SourceTypeSchema>;
/**
 * Core Event Schema - Normalized disaster event
 */
export declare const DisasterEventSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    source: z.ZodEnum<["usgs", "imd", "gdacs", "firms", "openaq", "openweather", "crowd", "social_media", "operator", "satellite"]>;
    sourceId: z.ZodString;
    disasterType: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
    severity: z.ZodEnum<["info", "warning", "alert", "emergency"]>;
    confidence: z.ZodNumber;
    location: z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>;
    area: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"Polygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "Polygon";
        coordinates: number[][][];
    }, {
        type: "Polygon";
        coordinates: number[][][];
    }>>;
    properties: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodString;
    receivedAt: z.ZodString;
    processedAt: z.ZodOptional<z.ZodString>;
    processingVersion: z.ZodOptional<z.ZodString>;
    rawData: z.ZodOptional<z.ZodUnknown>;
    deduplicationKey: z.ZodOptional<z.ZodString>;
    reporterId: z.ZodOptional<z.ZodString>;
    reporterTrustScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    properties: Record<string, unknown>;
    source: "social_media" | "usgs" | "imd" | "gdacs" | "firms" | "openaq" | "openweather" | "crowd" | "operator" | "satellite";
    sourceId: string;
    disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
    severity: "info" | "warning" | "alert" | "emergency";
    confidence: number;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    timestamp: string;
    receivedAt: string;
    _id?: string | undefined;
    area?: {
        type: "Polygon";
        coordinates: number[][][];
    } | undefined;
    processedAt?: string | undefined;
    processingVersion?: string | undefined;
    rawData?: unknown;
    deduplicationKey?: string | undefined;
    reporterId?: string | undefined;
    reporterTrustScore?: number | undefined;
}, {
    source: "social_media" | "usgs" | "imd" | "gdacs" | "firms" | "openaq" | "openweather" | "crowd" | "operator" | "satellite";
    sourceId: string;
    disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
    severity: "info" | "warning" | "alert" | "emergency";
    confidence: number;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    timestamp: string;
    receivedAt: string;
    properties?: Record<string, unknown> | undefined;
    _id?: string | undefined;
    area?: {
        type: "Polygon";
        coordinates: number[][][];
    } | undefined;
    processedAt?: string | undefined;
    processingVersion?: string | undefined;
    rawData?: unknown;
    deduplicationKey?: string | undefined;
    reporterId?: string | undefined;
    reporterTrustScore?: number | undefined;
}>;
export type DisasterEvent = z.infer<typeof DisasterEventSchema>;
/**
 * Alert Schema
 */
export declare const AlertSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    eventIds: z.ZodArray<z.ZodString, "many">;
    disasterType: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
    severity: z.ZodEnum<["info", "warning", "alert", "emergency"]>;
    confidence: z.ZodNumber;
    location: z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>;
    affectedArea: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"Polygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "Polygon";
        coordinates: number[][][];
    }, {
        type: "Polygon";
        coordinates: number[][][];
    }>>;
    affectedPopulation: z.ZodOptional<z.ZodNumber>;
    messages: z.ZodArray<z.ZodObject<{
        lang: z.ZodString;
        channel: z.ZodString;
        content: z.ZodString;
        templateId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lang: string;
        channel: string;
        content: string;
        templateId?: string | undefined;
    }, {
        lang: string;
        channel: string;
        content: string;
        templateId?: string | undefined;
    }>, "many">;
    capXml: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["draft", "issued", "cancelled", "expired"]>>;
    issuedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    cancelledAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodDefault<z.ZodString>;
    dispatches: z.ZodDefault<z.ZodArray<z.ZodObject<{
        channel: z.ZodString;
        recipient: z.ZodString;
        status: z.ZodEnum<["pending", "sent", "delivered", "failed", "bounced"]>;
        sentAt: z.ZodOptional<z.ZodString>;
        deliveredAt: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        providerResponse: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "sent" | "delivered" | "failed" | "bounced";
        channel: string;
        recipient: string;
        sentAt?: string | undefined;
        deliveredAt?: string | undefined;
        error?: string | undefined;
        providerResponse?: unknown;
    }, {
        status: "pending" | "sent" | "delivered" | "failed" | "bounced";
        channel: string;
        recipient: string;
        sentAt?: string | undefined;
        deliveredAt?: string | undefined;
        error?: string | undefined;
        providerResponse?: unknown;
    }>, "many">>;
    issuedBy: z.ZodOptional<z.ZodString>;
    cancelReason: z.ZodOptional<z.ZodString>;
    relatedAlerts: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "draft" | "issued" | "cancelled" | "expired";
    disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
    severity: "info" | "warning" | "alert" | "emergency";
    confidence: number;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    eventIds: string[];
    messages: {
        lang: string;
        channel: string;
        content: string;
        templateId?: string | undefined;
    }[];
    capXml: string;
    createdAt: string;
    updatedAt: string;
    dispatches: {
        status: "pending" | "sent" | "delivered" | "failed" | "bounced";
        channel: string;
        recipient: string;
        sentAt?: string | undefined;
        deliveredAt?: string | undefined;
        error?: string | undefined;
        providerResponse?: unknown;
    }[];
    relatedAlerts: string[];
    _id?: string | undefined;
    affectedArea?: {
        type: "Polygon";
        coordinates: number[][][];
    } | undefined;
    affectedPopulation?: number | undefined;
    issuedAt?: string | undefined;
    expiresAt?: string | undefined;
    cancelledAt?: string | undefined;
    issuedBy?: string | undefined;
    cancelReason?: string | undefined;
}, {
    disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
    severity: "info" | "warning" | "alert" | "emergency";
    confidence: number;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    eventIds: string[];
    messages: {
        lang: string;
        channel: string;
        content: string;
        templateId?: string | undefined;
    }[];
    capXml: string;
    status?: "draft" | "issued" | "cancelled" | "expired" | undefined;
    _id?: string | undefined;
    affectedArea?: {
        type: "Polygon";
        coordinates: number[][][];
    } | undefined;
    affectedPopulation?: number | undefined;
    issuedAt?: string | undefined;
    expiresAt?: string | undefined;
    cancelledAt?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    dispatches?: {
        status: "pending" | "sent" | "delivered" | "failed" | "bounced";
        channel: string;
        recipient: string;
        sentAt?: string | undefined;
        deliveredAt?: string | undefined;
        error?: string | undefined;
        providerResponse?: unknown;
    }[] | undefined;
    issuedBy?: string | undefined;
    cancelReason?: string | undefined;
    relatedAlerts?: string[] | undefined;
}>;
export type Alert = z.infer<typeof AlertSchema>;
/**
 * Crowd Report Schema
 */
export declare const CrowdReportSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    anonymous: z.ZodDefault<z.ZodBoolean>;
    disasterType: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
    severity: z.ZodEnum<["info", "minor", "moderate", "severe", "critical"]>;
    location: z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>;
    description: z.ZodString;
    media: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["photo", "video", "audio"]>;
        url: z.ZodString;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        type: "photo" | "video" | "audio";
        url: string;
        mimeType: string;
        size: number;
        thumbnailUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        type: "photo" | "video" | "audio";
        url: string;
        mimeType: string;
        size: number;
        thumbnailUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">>;
    timestamp: z.ZodDefault<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["pending", "verified", "rejected", "escalated"]>>;
    verification: z.ZodDefault<z.ZodObject<{
        verified: z.ZodDefault<z.ZodBoolean>;
        verifiedBy: z.ZodOptional<z.ZodString>;
        verifiedAt: z.ZodOptional<z.ZodString>;
        voteCount: z.ZodDefault<z.ZodNumber>;
        agreeVotes: z.ZodDefault<z.ZodNumber>;
        disagreeVotes: z.ZodDefault<z.ZodNumber>;
        trustScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        verified: boolean;
        voteCount: number;
        agreeVotes: number;
        disagreeVotes: number;
        verifiedBy?: string | undefined;
        verifiedAt?: string | undefined;
        trustScore?: number | undefined;
    }, {
        verified?: boolean | undefined;
        verifiedBy?: string | undefined;
        verifiedAt?: string | undefined;
        voteCount?: number | undefined;
        agreeVotes?: number | undefined;
        disagreeVotes?: number | undefined;
        trustScore?: number | undefined;
    }>>;
    contactInfo: z.ZodOptional<z.ZodString>;
    clusterId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "verified" | "rejected" | "escalated";
    disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
    severity: "info" | "minor" | "moderate" | "severe" | "critical";
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    timestamp: string;
    anonymous: boolean;
    description: string;
    media: {
        type: "photo" | "video" | "audio";
        url: string;
        mimeType: string;
        size: number;
        thumbnailUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
    verification: {
        verified: boolean;
        voteCount: number;
        agreeVotes: number;
        disagreeVotes: number;
        verifiedBy?: string | undefined;
        verifiedAt?: string | undefined;
        trustScore?: number | undefined;
    };
    _id?: string | undefined;
    userId?: string | undefined;
    contactInfo?: string | undefined;
    clusterId?: string | undefined;
}, {
    disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
    severity: "info" | "minor" | "moderate" | "severe" | "critical";
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    description: string;
    status?: "pending" | "verified" | "rejected" | "escalated" | undefined;
    _id?: string | undefined;
    timestamp?: string | undefined;
    userId?: string | undefined;
    anonymous?: boolean | undefined;
    media?: {
        type: "photo" | "video" | "audio";
        url: string;
        mimeType: string;
        size: number;
        thumbnailUrl?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[] | undefined;
    verification?: {
        verified?: boolean | undefined;
        verifiedBy?: string | undefined;
        verifiedAt?: string | undefined;
        voteCount?: number | undefined;
        agreeVotes?: number | undefined;
        disagreeVotes?: number | undefined;
        trustScore?: number | undefined;
    } | undefined;
    contactInfo?: string | undefined;
    clusterId?: string | undefined;
}>;
export type CrowdReport = z.infer<typeof CrowdReportSchema>;
/**
 * User Schema
 */
export declare const UserSchema: z.ZodObject<{
    _id: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    location: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>>;
    preferences: z.ZodDefault<z.ZodObject<{
        minSeverity: z.ZodDefault<z.ZodEnum<["info", "warning", "alert", "emergency"]>>;
        channels: z.ZodDefault<z.ZodArray<z.ZodEnum<["sms", "email", "push", "whatsapp", "webhook", "social_media", "siren", "cell_broadcast", "radio", "tv", "operator_dashboard"]>, "many">>;
        quietHours: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            start: z.ZodDefault<z.ZodString>;
            end: z.ZodDefault<z.ZodString>;
            timezone: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        }, {
            enabled?: boolean | undefined;
            start?: string | undefined;
            end?: string | undefined;
            timezone?: string | undefined;
        }>>;
        autoExpandArea: z.ZodDefault<z.ZodBoolean>;
        expansionRadiusKm: z.ZodDefault<z.ZodNumber>;
        disasterTypes: z.ZodDefault<z.ZodArray<z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        minSeverity: "info" | "warning" | "alert" | "emergency";
        channels: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[];
        quietHours: {
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        };
        autoExpandArea: boolean;
        expansionRadiusKm: number;
        disasterTypes: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[];
    }, {
        minSeverity?: "info" | "warning" | "alert" | "emergency" | undefined;
        channels?: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[] | undefined;
        quietHours?: {
            enabled?: boolean | undefined;
            start?: string | undefined;
            end?: string | undefined;
            timezone?: string | undefined;
        } | undefined;
        autoExpandArea?: boolean | undefined;
        expansionRadiusKm?: number | undefined;
        disasterTypes?: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[] | undefined;
    }>>;
    active: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDefault<z.ZodString>;
    lastActiveAt: z.ZodOptional<z.ZodString>;
    pushTokens: z.ZodDefault<z.ZodArray<z.ZodObject<{
        token: z.ZodString;
        platform: z.ZodEnum<["ios", "android", "web"]>;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        updatedAt: string;
        token: string;
        platform: "ios" | "android" | "web";
    }, {
        updatedAt: string;
        token: string;
        platform: "ios" | "android" | "web";
    }>, "many">>;
    trustScore: z.ZodDefault<z.ZodNumber>;
    roles: z.ZodDefault<z.ZodArray<z.ZodEnum<["user", "operator", "admin", "verifier"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    trustScore: number;
    language: string;
    preferences: {
        minSeverity: "info" | "warning" | "alert" | "emergency";
        channels: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[];
        quietHours: {
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        };
        autoExpandArea: boolean;
        expansionRadiusKm: number;
        disasterTypes: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[];
    };
    active: boolean;
    pushTokens: {
        updatedAt: string;
        token: string;
        platform: "ios" | "android" | "web";
    }[];
    roles: ("operator" | "user" | "admin" | "verifier")[];
    email?: string | undefined;
    _id?: string | undefined;
    location?: {
        type: "Point";
        coordinates: [number, number];
    } | undefined;
    phone?: string | undefined;
    name?: string | undefined;
    lastActiveAt?: string | undefined;
}, {
    email?: string | undefined;
    _id?: string | undefined;
    location?: {
        type: "Point";
        coordinates: [number, number];
    } | undefined;
    createdAt?: string | undefined;
    trustScore?: number | undefined;
    phone?: string | undefined;
    name?: string | undefined;
    language?: string | undefined;
    preferences?: {
        minSeverity?: "info" | "warning" | "alert" | "emergency" | undefined;
        channels?: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[] | undefined;
        quietHours?: {
            enabled?: boolean | undefined;
            start?: string | undefined;
            end?: string | undefined;
            timezone?: string | undefined;
        } | undefined;
        autoExpandArea?: boolean | undefined;
        expansionRadiusKm?: number | undefined;
        disasterTypes?: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[] | undefined;
    } | undefined;
    active?: boolean | undefined;
    lastActiveAt?: string | undefined;
    pushTokens?: {
        updatedAt: string;
        token: string;
        platform: "ios" | "android" | "web";
    }[] | undefined;
    roles?: ("operator" | "user" | "admin" | "verifier")[] | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
/**
 * Dispatch Record
 */
export declare const DispatchRecordSchema: z.ZodObject<{
    channel: z.ZodEnum<["sms", "email", "push", "whatsapp", "webhook", "social_media", "siren", "cell_broadcast", "radio", "tv", "operator_dashboard"]>;
    recipient: z.ZodString;
    status: z.ZodEnum<["pending", "sent", "delivered", "failed", "bounced", "rejected"]>;
    sentAt: z.ZodOptional<z.ZodString>;
    deliveredAt: z.ZodOptional<z.ZodString>;
    failedAt: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    providerResponse: z.ZodOptional<z.ZodUnknown>;
    retryCount: z.ZodDefault<z.ZodNumber>;
    cost: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "sent" | "delivered" | "failed" | "bounced" | "rejected";
    channel: "push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard";
    recipient: string;
    retryCount: number;
    sentAt?: string | undefined;
    deliveredAt?: string | undefined;
    error?: string | undefined;
    providerResponse?: unknown;
    failedAt?: string | undefined;
    cost?: number | undefined;
}, {
    status: "pending" | "sent" | "delivered" | "failed" | "bounced" | "rejected";
    channel: "push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard";
    recipient: string;
    sentAt?: string | undefined;
    deliveredAt?: string | undefined;
    error?: string | undefined;
    providerResponse?: unknown;
    failedAt?: string | undefined;
    retryCount?: number | undefined;
    cost?: number | undefined;
}>;
export type DispatchRecord = z.infer<typeof DispatchRecordSchema>;
/**
 * CAP Alert Schema (simplified for validation)
 */
export declare const CapAlertSchema: z.ZodObject<{
    identifier: z.ZodString;
    sender: z.ZodString;
    sent: z.ZodString;
    status: z.ZodEnum<["Actual", "Exercise", "Test", "Draft"]>;
    msgType: z.ZodEnum<["Alert", "Update", "Cancel", "Ack", "Error"]>;
    scope: z.ZodEnum<["Public", "Restricted", "Private"]>;
    info: z.ZodArray<z.ZodObject<{
        language: z.ZodString;
        category: z.ZodEnum<["Geo", "Met", "Safety", "Security", "Rescue", "Fire", "Health", "Env", "Transport", "Infra", "CBRNE", "Other"]>;
        event: z.ZodString;
        urgency: z.ZodEnum<["Immediate", "Expected", "Future", "Past", "Unknown"]>;
        severity: z.ZodEnum<["Extreme", "Severe", "Moderate", "Minor", "Unknown"]>;
        certainty: z.ZodEnum<["Observed", "Likely", "Possible", "Unlikely", "Unknown"]>;
        effective: z.ZodOptional<z.ZodString>;
        onset: z.ZodOptional<z.ZodString>;
        expires: z.ZodOptional<z.ZodString>;
        senderName: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        instruction: z.ZodOptional<z.ZodString>;
        contact: z.ZodOptional<z.ZodString>;
        area: z.ZodOptional<z.ZodArray<z.ZodObject<{
            areaDesc: z.ZodString;
            polygon: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            circle: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
            geocode: z.ZodOptional<z.ZodArray<z.ZodObject<{
                valueName: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                valueName: string;
            }, {
                value: string;
                valueName: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            areaDesc: string;
            polygon?: number[] | undefined;
            circle?: [number, number, number] | undefined;
            geocode?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }, {
            areaDesc: string;
            polygon?: number[] | undefined;
            circle?: [number, number, number] | undefined;
            geocode?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }>, "many">>;
        parameter: z.ZodOptional<z.ZodArray<z.ZodObject<{
            valueName: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            valueName: string;
        }, {
            value: string;
            valueName: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
        language: string;
        category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
        event: string;
        urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
        certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
        area?: {
            areaDesc: string;
            polygon?: number[] | undefined;
            circle?: [number, number, number] | undefined;
            geocode?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }[] | undefined;
        description?: string | undefined;
        effective?: string | undefined;
        onset?: string | undefined;
        expires?: string | undefined;
        senderName?: string | undefined;
        headline?: string | undefined;
        instruction?: string | undefined;
        contact?: string | undefined;
        parameter?: {
            value: string;
            valueName: string;
        }[] | undefined;
    }, {
        severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
        language: string;
        category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
        event: string;
        urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
        certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
        area?: {
            areaDesc: string;
            polygon?: number[] | undefined;
            circle?: [number, number, number] | undefined;
            geocode?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }[] | undefined;
        description?: string | undefined;
        effective?: string | undefined;
        onset?: string | undefined;
        expires?: string | undefined;
        senderName?: string | undefined;
        headline?: string | undefined;
        instruction?: string | undefined;
        contact?: string | undefined;
        parameter?: {
            value: string;
            valueName: string;
        }[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "Actual" | "Exercise" | "Test" | "Draft";
    info: {
        severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
        language: string;
        category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
        event: string;
        urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
        certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
        area?: {
            areaDesc: string;
            polygon?: number[] | undefined;
            circle?: [number, number, number] | undefined;
            geocode?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }[] | undefined;
        description?: string | undefined;
        effective?: string | undefined;
        onset?: string | undefined;
        expires?: string | undefined;
        senderName?: string | undefined;
        headline?: string | undefined;
        instruction?: string | undefined;
        contact?: string | undefined;
        parameter?: {
            value: string;
            valueName: string;
        }[] | undefined;
    }[];
    sent: string;
    identifier: string;
    sender: string;
    msgType: "Alert" | "Update" | "Cancel" | "Ack" | "Error";
    scope: "Public" | "Restricted" | "Private";
}, {
    status: "Actual" | "Exercise" | "Test" | "Draft";
    info: {
        severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
        language: string;
        category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
        event: string;
        urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
        certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
        area?: {
            areaDesc: string;
            polygon?: number[] | undefined;
            circle?: [number, number, number] | undefined;
            geocode?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }[] | undefined;
        description?: string | undefined;
        effective?: string | undefined;
        onset?: string | undefined;
        expires?: string | undefined;
        senderName?: string | undefined;
        headline?: string | undefined;
        instruction?: string | undefined;
        contact?: string | undefined;
        parameter?: {
            value: string;
            valueName: string;
        }[] | undefined;
    }[];
    sent: string;
    identifier: string;
    sender: string;
    msgType: "Alert" | "Update" | "Cancel" | "Ack" | "Error";
    scope: "Public" | "Restricted" | "Private";
}>;
export type CapAlert = z.infer<typeof CapAlertSchema>;
/**
 * API Response Schemas
 */
export declare const PaginatedResponseSchema: <T extends z.ZodTypeAny>(itemSchema: T) => z.ZodObject<{
    data: z.ZodArray<T, "many">;
    pagination: z.ZodObject<{
        page: z.ZodNumber;
        limit: z.ZodNumber;
        total: z.ZodNumber;
        totalPages: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }, {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    data: T["_output"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}, {
    timestamp: string;
    data: T["_input"][];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare const ApiResponseSchema: <T extends z.ZodTypeAny>(itemSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: unknown;
    }, {
        code: string;
        message: string;
        details?: unknown;
    }>>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: unknown;
    }, {
        code: string;
        message: string;
        details?: unknown;
    }>>;
    timestamp: z.ZodString;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: unknown;
    }, {
        code: string;
        message: string;
        details?: unknown;
    }>>;
    timestamp: z.ZodString;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
/**
 * WebSocket Event Schemas
 */
export declare const WSEventSchema: z.ZodObject<{
    type: z.ZodEnum<["event:new", "event:update", "alert:issued", "alert:cancelled", "alert:expired", "crowd_report:new", "crowd_report:verified", "user:location_update", "system:status"]>;
    payload: z.ZodUnknown;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "event:new" | "event:update" | "alert:issued" | "alert:cancelled" | "alert:expired" | "crowd_report:new" | "crowd_report:verified" | "user:location_update" | "system:status";
    timestamp: string;
    payload?: unknown;
}, {
    type: "event:new" | "event:update" | "alert:issued" | "alert:cancelled" | "alert:expired" | "crowd_report:new" | "crowd_report:verified" | "user:location_update" | "system:status";
    timestamp: string;
    payload?: unknown;
}>;
export type WSEvent = z.infer<typeof WSEventSchema>;
/**
 * Export all schemas
 */
export declare const Schemas: {
    Position: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    Point: z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>;
    Polygon: z.ZodObject<{
        type: z.ZodLiteral<"Polygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "Polygon";
        coordinates: number[][][];
    }, {
        type: "Polygon";
        coordinates: number[][][];
    }>;
    MultiPolygon: z.ZodObject<{
        type: z.ZodLiteral<"MultiPolygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "MultiPolygon";
        coordinates: number[][][][];
    }, {
        type: "MultiPolygon";
        coordinates: number[][][][];
    }>;
    Geometry: z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"Point">;
        coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        type: "Point";
        coordinates: [number, number];
    }, {
        type: "Point";
        coordinates: [number, number];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"Polygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "Polygon";
        coordinates: number[][][];
    }, {
        type: "Polygon";
        coordinates: number[][][];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"MultiPolygon">;
        coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        type: "MultiPolygon";
        coordinates: number[][][][];
    }, {
        type: "MultiPolygon";
        coordinates: number[][][][];
    }>]>;
    Feature: z.ZodObject<{
        type: z.ZodLiteral<"Feature">;
        geometry: z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            type: "Point";
            coordinates: [number, number];
        }, {
            type: "Point";
            coordinates: [number, number];
        }>, z.ZodObject<{
            type: z.ZodLiteral<"Polygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "Polygon";
            coordinates: number[][][];
        }, {
            type: "Polygon";
            coordinates: number[][][];
        }>, z.ZodObject<{
            type: z.ZodLiteral<"MultiPolygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "MultiPolygon";
            coordinates: number[][][][];
        }, {
            type: "MultiPolygon";
            coordinates: number[][][][];
        }>]>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    }, "strip", z.ZodTypeAny, {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        } | {
            type: "Polygon";
            coordinates: number[][][];
        } | {
            type: "MultiPolygon";
            coordinates: number[][][][];
        };
        properties?: Record<string, unknown> | undefined;
        id?: string | number | undefined;
    }, {
        type: "Feature";
        geometry: {
            type: "Point";
            coordinates: [number, number];
        } | {
            type: "Polygon";
            coordinates: number[][][];
        } | {
            type: "MultiPolygon";
            coordinates: number[][][][];
        };
        properties?: Record<string, unknown> | undefined;
        id?: string | number | undefined;
    }>;
    FeatureCollection: z.ZodObject<{
        type: z.ZodLiteral<"FeatureCollection">;
        features: z.ZodArray<z.ZodObject<{
            type: z.ZodLiteral<"Feature">;
            geometry: z.ZodUnion<[z.ZodObject<{
                type: z.ZodLiteral<"Point">;
                coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            }, "strip", z.ZodTypeAny, {
                type: "Point";
                coordinates: [number, number];
            }, {
                type: "Point";
                coordinates: [number, number];
            }>, z.ZodObject<{
                type: z.ZodLiteral<"Polygon">;
                coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
            }, "strip", z.ZodTypeAny, {
                type: "Polygon";
                coordinates: number[][][];
            }, {
                type: "Polygon";
                coordinates: number[][][];
            }>, z.ZodObject<{
                type: z.ZodLiteral<"MultiPolygon">;
                coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">, "many">;
            }, "strip", z.ZodTypeAny, {
                type: "MultiPolygon";
                coordinates: number[][][][];
            }, {
                type: "MultiPolygon";
                coordinates: number[][][][];
            }>]>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strip", z.ZodTypeAny, {
            type: "Feature";
            geometry: {
                type: "Point";
                coordinates: [number, number];
            } | {
                type: "Polygon";
                coordinates: number[][][];
            } | {
                type: "MultiPolygon";
                coordinates: number[][][][];
            };
            properties?: Record<string, unknown> | undefined;
            id?: string | number | undefined;
        }, {
            type: "Feature";
            geometry: {
                type: "Point";
                coordinates: [number, number];
            } | {
                type: "Polygon";
                coordinates: number[][][];
            } | {
                type: "MultiPolygon";
                coordinates: number[][][][];
            };
            properties?: Record<string, unknown> | undefined;
            id?: string | number | undefined;
        }>, "many">;
        bbox: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
    }, "strip", z.ZodTypeAny, {
        type: "FeatureCollection";
        features: {
            type: "Feature";
            geometry: {
                type: "Point";
                coordinates: [number, number];
            } | {
                type: "Polygon";
                coordinates: number[][][];
            } | {
                type: "MultiPolygon";
                coordinates: number[][][][];
            };
            properties?: Record<string, unknown> | undefined;
            id?: string | number | undefined;
        }[];
        bbox?: [number, number, number, number] | undefined;
    }, {
        type: "FeatureCollection";
        features: {
            type: "Feature";
            geometry: {
                type: "Point";
                coordinates: [number, number];
            } | {
                type: "Polygon";
                coordinates: number[][][];
            } | {
                type: "MultiPolygon";
                coordinates: number[][][][];
            };
            properties?: Record<string, unknown> | undefined;
            id?: string | number | undefined;
        }[];
        bbox?: [number, number, number, number] | undefined;
    }>;
    DisasterType: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
    Severity: z.ZodEnum<["info", "warning", "alert", "emergency"]>;
    AlertStatus: z.ZodEnum<["draft", "issued", "cancelled", "expired"]>;
    Channel: z.ZodEnum<["sms", "email", "push", "whatsapp", "webhook", "social_media", "siren", "cell_broadcast", "radio", "tv", "operator_dashboard"]>;
    SourceType: z.ZodEnum<["usgs", "imd", "gdacs", "firms", "openaq", "openweather", "crowd", "social_media", "operator", "satellite"]>;
    DisasterEvent: z.ZodObject<{
        _id: z.ZodOptional<z.ZodString>;
        source: z.ZodEnum<["usgs", "imd", "gdacs", "firms", "openaq", "openweather", "crowd", "social_media", "operator", "satellite"]>;
        sourceId: z.ZodString;
        disasterType: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
        severity: z.ZodEnum<["info", "warning", "alert", "emergency"]>;
        confidence: z.ZodNumber;
        location: z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            type: "Point";
            coordinates: [number, number];
        }, {
            type: "Point";
            coordinates: [number, number];
        }>;
        area: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"Polygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "Polygon";
            coordinates: number[][][];
        }, {
            type: "Polygon";
            coordinates: number[][][];
        }>>;
        properties: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        timestamp: z.ZodString;
        receivedAt: z.ZodString;
        processedAt: z.ZodOptional<z.ZodString>;
        processingVersion: z.ZodOptional<z.ZodString>;
        rawData: z.ZodOptional<z.ZodUnknown>;
        deduplicationKey: z.ZodOptional<z.ZodString>;
        reporterId: z.ZodOptional<z.ZodString>;
        reporterTrustScore: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        properties: Record<string, unknown>;
        source: "social_media" | "usgs" | "imd" | "gdacs" | "firms" | "openaq" | "openweather" | "crowd" | "operator" | "satellite";
        sourceId: string;
        disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
        severity: "info" | "warning" | "alert" | "emergency";
        confidence: number;
        location: {
            type: "Point";
            coordinates: [number, number];
        };
        timestamp: string;
        receivedAt: string;
        _id?: string | undefined;
        area?: {
            type: "Polygon";
            coordinates: number[][][];
        } | undefined;
        processedAt?: string | undefined;
        processingVersion?: string | undefined;
        rawData?: unknown;
        deduplicationKey?: string | undefined;
        reporterId?: string | undefined;
        reporterTrustScore?: number | undefined;
    }, {
        source: "social_media" | "usgs" | "imd" | "gdacs" | "firms" | "openaq" | "openweather" | "crowd" | "operator" | "satellite";
        sourceId: string;
        disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
        severity: "info" | "warning" | "alert" | "emergency";
        confidence: number;
        location: {
            type: "Point";
            coordinates: [number, number];
        };
        timestamp: string;
        receivedAt: string;
        properties?: Record<string, unknown> | undefined;
        _id?: string | undefined;
        area?: {
            type: "Polygon";
            coordinates: number[][][];
        } | undefined;
        processedAt?: string | undefined;
        processingVersion?: string | undefined;
        rawData?: unknown;
        deduplicationKey?: string | undefined;
        reporterId?: string | undefined;
        reporterTrustScore?: number | undefined;
    }>;
    Alert: z.ZodObject<{
        _id: z.ZodOptional<z.ZodString>;
        eventIds: z.ZodArray<z.ZodString, "many">;
        disasterType: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
        severity: z.ZodEnum<["info", "warning", "alert", "emergency"]>;
        confidence: z.ZodNumber;
        location: z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            type: "Point";
            coordinates: [number, number];
        }, {
            type: "Point";
            coordinates: [number, number];
        }>;
        affectedArea: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"Polygon">;
            coordinates: z.ZodArray<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">, "many">;
        }, "strip", z.ZodTypeAny, {
            type: "Polygon";
            coordinates: number[][][];
        }, {
            type: "Polygon";
            coordinates: number[][][];
        }>>;
        affectedPopulation: z.ZodOptional<z.ZodNumber>;
        messages: z.ZodArray<z.ZodObject<{
            lang: z.ZodString;
            channel: z.ZodString;
            content: z.ZodString;
            templateId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            lang: string;
            channel: string;
            content: string;
            templateId?: string | undefined;
        }, {
            lang: string;
            channel: string;
            content: string;
            templateId?: string | undefined;
        }>, "many">;
        capXml: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["draft", "issued", "cancelled", "expired"]>>;
        issuedAt: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodString>;
        cancelledAt: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDefault<z.ZodString>;
        updatedAt: z.ZodDefault<z.ZodString>;
        dispatches: z.ZodDefault<z.ZodArray<z.ZodObject<{
            channel: z.ZodString;
            recipient: z.ZodString;
            status: z.ZodEnum<["pending", "sent", "delivered", "failed", "bounced"]>;
            sentAt: z.ZodOptional<z.ZodString>;
            deliveredAt: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
            providerResponse: z.ZodOptional<z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            status: "pending" | "sent" | "delivered" | "failed" | "bounced";
            channel: string;
            recipient: string;
            sentAt?: string | undefined;
            deliveredAt?: string | undefined;
            error?: string | undefined;
            providerResponse?: unknown;
        }, {
            status: "pending" | "sent" | "delivered" | "failed" | "bounced";
            channel: string;
            recipient: string;
            sentAt?: string | undefined;
            deliveredAt?: string | undefined;
            error?: string | undefined;
            providerResponse?: unknown;
        }>, "many">>;
        issuedBy: z.ZodOptional<z.ZodString>;
        cancelReason: z.ZodOptional<z.ZodString>;
        relatedAlerts: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        status: "draft" | "issued" | "cancelled" | "expired";
        disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
        severity: "info" | "warning" | "alert" | "emergency";
        confidence: number;
        location: {
            type: "Point";
            coordinates: [number, number];
        };
        eventIds: string[];
        messages: {
            lang: string;
            channel: string;
            content: string;
            templateId?: string | undefined;
        }[];
        capXml: string;
        createdAt: string;
        updatedAt: string;
        dispatches: {
            status: "pending" | "sent" | "delivered" | "failed" | "bounced";
            channel: string;
            recipient: string;
            sentAt?: string | undefined;
            deliveredAt?: string | undefined;
            error?: string | undefined;
            providerResponse?: unknown;
        }[];
        relatedAlerts: string[];
        _id?: string | undefined;
        affectedArea?: {
            type: "Polygon";
            coordinates: number[][][];
        } | undefined;
        affectedPopulation?: number | undefined;
        issuedAt?: string | undefined;
        expiresAt?: string | undefined;
        cancelledAt?: string | undefined;
        issuedBy?: string | undefined;
        cancelReason?: string | undefined;
    }, {
        disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
        severity: "info" | "warning" | "alert" | "emergency";
        confidence: number;
        location: {
            type: "Point";
            coordinates: [number, number];
        };
        eventIds: string[];
        messages: {
            lang: string;
            channel: string;
            content: string;
            templateId?: string | undefined;
        }[];
        capXml: string;
        status?: "draft" | "issued" | "cancelled" | "expired" | undefined;
        _id?: string | undefined;
        affectedArea?: {
            type: "Polygon";
            coordinates: number[][][];
        } | undefined;
        affectedPopulation?: number | undefined;
        issuedAt?: string | undefined;
        expiresAt?: string | undefined;
        cancelledAt?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        dispatches?: {
            status: "pending" | "sent" | "delivered" | "failed" | "bounced";
            channel: string;
            recipient: string;
            sentAt?: string | undefined;
            deliveredAt?: string | undefined;
            error?: string | undefined;
            providerResponse?: unknown;
        }[] | undefined;
        issuedBy?: string | undefined;
        cancelReason?: string | undefined;
        relatedAlerts?: string[] | undefined;
    }>;
    CrowdReport: z.ZodObject<{
        _id: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
        anonymous: z.ZodDefault<z.ZodBoolean>;
        disasterType: z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>;
        severity: z.ZodEnum<["info", "minor", "moderate", "severe", "critical"]>;
        location: z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            type: "Point";
            coordinates: [number, number];
        }, {
            type: "Point";
            coordinates: [number, number];
        }>;
        description: z.ZodString;
        media: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["photo", "video", "audio"]>;
            url: z.ZodString;
            thumbnailUrl: z.ZodOptional<z.ZodString>;
            mimeType: z.ZodString;
            size: z.ZodNumber;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            type: "photo" | "video" | "audio";
            url: string;
            mimeType: string;
            size: number;
            thumbnailUrl?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }, {
            type: "photo" | "video" | "audio";
            url: string;
            mimeType: string;
            size: number;
            thumbnailUrl?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }>, "many">>;
        timestamp: z.ZodDefault<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["pending", "verified", "rejected", "escalated"]>>;
        verification: z.ZodDefault<z.ZodObject<{
            verified: z.ZodDefault<z.ZodBoolean>;
            verifiedBy: z.ZodOptional<z.ZodString>;
            verifiedAt: z.ZodOptional<z.ZodString>;
            voteCount: z.ZodDefault<z.ZodNumber>;
            agreeVotes: z.ZodDefault<z.ZodNumber>;
            disagreeVotes: z.ZodDefault<z.ZodNumber>;
            trustScore: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            verified: boolean;
            voteCount: number;
            agreeVotes: number;
            disagreeVotes: number;
            verifiedBy?: string | undefined;
            verifiedAt?: string | undefined;
            trustScore?: number | undefined;
        }, {
            verified?: boolean | undefined;
            verifiedBy?: string | undefined;
            verifiedAt?: string | undefined;
            voteCount?: number | undefined;
            agreeVotes?: number | undefined;
            disagreeVotes?: number | undefined;
            trustScore?: number | undefined;
        }>>;
        contactInfo: z.ZodOptional<z.ZodString>;
        clusterId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "verified" | "rejected" | "escalated";
        disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
        severity: "info" | "minor" | "moderate" | "severe" | "critical";
        location: {
            type: "Point";
            coordinates: [number, number];
        };
        timestamp: string;
        anonymous: boolean;
        description: string;
        media: {
            type: "photo" | "video" | "audio";
            url: string;
            mimeType: string;
            size: number;
            thumbnailUrl?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[];
        verification: {
            verified: boolean;
            voteCount: number;
            agreeVotes: number;
            disagreeVotes: number;
            verifiedBy?: string | undefined;
            verifiedAt?: string | undefined;
            trustScore?: number | undefined;
        };
        _id?: string | undefined;
        userId?: string | undefined;
        contactInfo?: string | undefined;
        clusterId?: string | undefined;
    }, {
        disasterType: "earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche";
        severity: "info" | "minor" | "moderate" | "severe" | "critical";
        location: {
            type: "Point";
            coordinates: [number, number];
        };
        description: string;
        status?: "pending" | "verified" | "rejected" | "escalated" | undefined;
        _id?: string | undefined;
        timestamp?: string | undefined;
        userId?: string | undefined;
        anonymous?: boolean | undefined;
        media?: {
            type: "photo" | "video" | "audio";
            url: string;
            mimeType: string;
            size: number;
            thumbnailUrl?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[] | undefined;
        verification?: {
            verified?: boolean | undefined;
            verifiedBy?: string | undefined;
            verifiedAt?: string | undefined;
            voteCount?: number | undefined;
            agreeVotes?: number | undefined;
            disagreeVotes?: number | undefined;
            trustScore?: number | undefined;
        } | undefined;
        contactInfo?: string | undefined;
        clusterId?: string | undefined;
    }>;
    User: z.ZodObject<{
        _id: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        location: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"Point">;
            coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            type: "Point";
            coordinates: [number, number];
        }, {
            type: "Point";
            coordinates: [number, number];
        }>>;
        preferences: z.ZodDefault<z.ZodObject<{
            minSeverity: z.ZodDefault<z.ZodEnum<["info", "warning", "alert", "emergency"]>>;
            channels: z.ZodDefault<z.ZodArray<z.ZodEnum<["sms", "email", "push", "whatsapp", "webhook", "social_media", "siren", "cell_broadcast", "radio", "tv", "operator_dashboard"]>, "many">>;
            quietHours: z.ZodDefault<z.ZodObject<{
                enabled: z.ZodDefault<z.ZodBoolean>;
                start: z.ZodDefault<z.ZodString>;
                end: z.ZodDefault<z.ZodString>;
                timezone: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                start: string;
                end: string;
                timezone: string;
            }, {
                enabled?: boolean | undefined;
                start?: string | undefined;
                end?: string | undefined;
                timezone?: string | undefined;
            }>>;
            autoExpandArea: z.ZodDefault<z.ZodBoolean>;
            expansionRadiusKm: z.ZodDefault<z.ZodNumber>;
            disasterTypes: z.ZodDefault<z.ZodArray<z.ZodEnum<["earthquake", "flood", "cyclone", "wildfire", "landslide", "heatwave", "tsunami", "air_quality", "volcano", "storm_surge", "drought", "cold_wave", "thunderstorm", "hail", "tornado", "avalanche"]>, "many">>;
        }, "strip", z.ZodTypeAny, {
            minSeverity: "info" | "warning" | "alert" | "emergency";
            channels: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[];
            quietHours: {
                enabled: boolean;
                start: string;
                end: string;
                timezone: string;
            };
            autoExpandArea: boolean;
            expansionRadiusKm: number;
            disasterTypes: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[];
        }, {
            minSeverity?: "info" | "warning" | "alert" | "emergency" | undefined;
            channels?: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[] | undefined;
            quietHours?: {
                enabled?: boolean | undefined;
                start?: string | undefined;
                end?: string | undefined;
                timezone?: string | undefined;
            } | undefined;
            autoExpandArea?: boolean | undefined;
            expansionRadiusKm?: number | undefined;
            disasterTypes?: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[] | undefined;
        }>>;
        active: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodDefault<z.ZodString>;
        lastActiveAt: z.ZodOptional<z.ZodString>;
        pushTokens: z.ZodDefault<z.ZodArray<z.ZodObject<{
            token: z.ZodString;
            platform: z.ZodEnum<["ios", "android", "web"]>;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            updatedAt: string;
            token: string;
            platform: "ios" | "android" | "web";
        }, {
            updatedAt: string;
            token: string;
            platform: "ios" | "android" | "web";
        }>, "many">>;
        trustScore: z.ZodDefault<z.ZodNumber>;
        roles: z.ZodDefault<z.ZodArray<z.ZodEnum<["user", "operator", "admin", "verifier"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        trustScore: number;
        language: string;
        preferences: {
            minSeverity: "info" | "warning" | "alert" | "emergency";
            channels: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[];
            quietHours: {
                enabled: boolean;
                start: string;
                end: string;
                timezone: string;
            };
            autoExpandArea: boolean;
            expansionRadiusKm: number;
            disasterTypes: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[];
        };
        active: boolean;
        pushTokens: {
            updatedAt: string;
            token: string;
            platform: "ios" | "android" | "web";
        }[];
        roles: ("operator" | "user" | "admin" | "verifier")[];
        email?: string | undefined;
        _id?: string | undefined;
        location?: {
            type: "Point";
            coordinates: [number, number];
        } | undefined;
        phone?: string | undefined;
        name?: string | undefined;
        lastActiveAt?: string | undefined;
    }, {
        email?: string | undefined;
        _id?: string | undefined;
        location?: {
            type: "Point";
            coordinates: [number, number];
        } | undefined;
        createdAt?: string | undefined;
        trustScore?: number | undefined;
        phone?: string | undefined;
        name?: string | undefined;
        language?: string | undefined;
        preferences?: {
            minSeverity?: "info" | "warning" | "alert" | "emergency" | undefined;
            channels?: ("push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard")[] | undefined;
            quietHours?: {
                enabled?: boolean | undefined;
                start?: string | undefined;
                end?: string | undefined;
                timezone?: string | undefined;
            } | undefined;
            autoExpandArea?: boolean | undefined;
            expansionRadiusKm?: number | undefined;
            disasterTypes?: ("earthquake" | "flood" | "cyclone" | "wildfire" | "landslide" | "heatwave" | "tsunami" | "air_quality" | "volcano" | "storm_surge" | "drought" | "cold_wave" | "thunderstorm" | "hail" | "tornado" | "avalanche")[] | undefined;
        } | undefined;
        active?: boolean | undefined;
        lastActiveAt?: string | undefined;
        pushTokens?: {
            updatedAt: string;
            token: string;
            platform: "ios" | "android" | "web";
        }[] | undefined;
        roles?: ("operator" | "user" | "admin" | "verifier")[] | undefined;
    }>;
    DispatchRecord: z.ZodObject<{
        channel: z.ZodEnum<["sms", "email", "push", "whatsapp", "webhook", "social_media", "siren", "cell_broadcast", "radio", "tv", "operator_dashboard"]>;
        recipient: z.ZodString;
        status: z.ZodEnum<["pending", "sent", "delivered", "failed", "bounced", "rejected"]>;
        sentAt: z.ZodOptional<z.ZodString>;
        deliveredAt: z.ZodOptional<z.ZodString>;
        failedAt: z.ZodOptional<z.ZodString>;
        error: z.ZodOptional<z.ZodString>;
        providerResponse: z.ZodOptional<z.ZodUnknown>;
        retryCount: z.ZodDefault<z.ZodNumber>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "sent" | "delivered" | "failed" | "bounced" | "rejected";
        channel: "push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard";
        recipient: string;
        retryCount: number;
        sentAt?: string | undefined;
        deliveredAt?: string | undefined;
        error?: string | undefined;
        providerResponse?: unknown;
        failedAt?: string | undefined;
        cost?: number | undefined;
    }, {
        status: "pending" | "sent" | "delivered" | "failed" | "bounced" | "rejected";
        channel: "push" | "sms" | "email" | "whatsapp" | "webhook" | "social_media" | "siren" | "cell_broadcast" | "radio" | "tv" | "operator_dashboard";
        recipient: string;
        sentAt?: string | undefined;
        deliveredAt?: string | undefined;
        error?: string | undefined;
        providerResponse?: unknown;
        failedAt?: string | undefined;
        retryCount?: number | undefined;
        cost?: number | undefined;
    }>;
    CapAlert: z.ZodObject<{
        identifier: z.ZodString;
        sender: z.ZodString;
        sent: z.ZodString;
        status: z.ZodEnum<["Actual", "Exercise", "Test", "Draft"]>;
        msgType: z.ZodEnum<["Alert", "Update", "Cancel", "Ack", "Error"]>;
        scope: z.ZodEnum<["Public", "Restricted", "Private"]>;
        info: z.ZodArray<z.ZodObject<{
            language: z.ZodString;
            category: z.ZodEnum<["Geo", "Met", "Safety", "Security", "Rescue", "Fire", "Health", "Env", "Transport", "Infra", "CBRNE", "Other"]>;
            event: z.ZodString;
            urgency: z.ZodEnum<["Immediate", "Expected", "Future", "Past", "Unknown"]>;
            severity: z.ZodEnum<["Extreme", "Severe", "Moderate", "Minor", "Unknown"]>;
            certainty: z.ZodEnum<["Observed", "Likely", "Possible", "Unlikely", "Unknown"]>;
            effective: z.ZodOptional<z.ZodString>;
            onset: z.ZodOptional<z.ZodString>;
            expires: z.ZodOptional<z.ZodString>;
            senderName: z.ZodOptional<z.ZodString>;
            headline: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            instruction: z.ZodOptional<z.ZodString>;
            contact: z.ZodOptional<z.ZodString>;
            area: z.ZodOptional<z.ZodArray<z.ZodObject<{
                areaDesc: z.ZodString;
                polygon: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                circle: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
                geocode: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    valueName: z.ZodString;
                    value: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    value: string;
                    valueName: string;
                }, {
                    value: string;
                    valueName: string;
                }>, "many">>;
            }, "strip", z.ZodTypeAny, {
                areaDesc: string;
                polygon?: number[] | undefined;
                circle?: [number, number, number] | undefined;
                geocode?: {
                    value: string;
                    valueName: string;
                }[] | undefined;
            }, {
                areaDesc: string;
                polygon?: number[] | undefined;
                circle?: [number, number, number] | undefined;
                geocode?: {
                    value: string;
                    valueName: string;
                }[] | undefined;
            }>, "many">>;
            parameter: z.ZodOptional<z.ZodArray<z.ZodObject<{
                valueName: z.ZodString;
                value: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                value: string;
                valueName: string;
            }, {
                value: string;
                valueName: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
            language: string;
            category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
            event: string;
            urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
            certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
            area?: {
                areaDesc: string;
                polygon?: number[] | undefined;
                circle?: [number, number, number] | undefined;
                geocode?: {
                    value: string;
                    valueName: string;
                }[] | undefined;
            }[] | undefined;
            description?: string | undefined;
            effective?: string | undefined;
            onset?: string | undefined;
            expires?: string | undefined;
            senderName?: string | undefined;
            headline?: string | undefined;
            instruction?: string | undefined;
            contact?: string | undefined;
            parameter?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }, {
            severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
            language: string;
            category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
            event: string;
            urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
            certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
            area?: {
                areaDesc: string;
                polygon?: number[] | undefined;
                circle?: [number, number, number] | undefined;
                geocode?: {
                    value: string;
                    valueName: string;
                }[] | undefined;
            }[] | undefined;
            description?: string | undefined;
            effective?: string | undefined;
            onset?: string | undefined;
            expires?: string | undefined;
            senderName?: string | undefined;
            headline?: string | undefined;
            instruction?: string | undefined;
            contact?: string | undefined;
            parameter?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        status: "Actual" | "Exercise" | "Test" | "Draft";
        info: {
            severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
            language: string;
            category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
            event: string;
            urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
            certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
            area?: {
                areaDesc: string;
                polygon?: number[] | undefined;
                circle?: [number, number, number] | undefined;
                geocode?: {
                    value: string;
                    valueName: string;
                }[] | undefined;
            }[] | undefined;
            description?: string | undefined;
            effective?: string | undefined;
            onset?: string | undefined;
            expires?: string | undefined;
            senderName?: string | undefined;
            headline?: string | undefined;
            instruction?: string | undefined;
            contact?: string | undefined;
            parameter?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }[];
        sent: string;
        identifier: string;
        sender: string;
        msgType: "Alert" | "Update" | "Cancel" | "Ack" | "Error";
        scope: "Public" | "Restricted" | "Private";
    }, {
        status: "Actual" | "Exercise" | "Test" | "Draft";
        info: {
            severity: "Unknown" | "Extreme" | "Severe" | "Moderate" | "Minor";
            language: string;
            category: "Geo" | "Met" | "Safety" | "Security" | "Rescue" | "Fire" | "Health" | "Env" | "Transport" | "Infra" | "CBRNE" | "Other";
            event: string;
            urgency: "Immediate" | "Expected" | "Future" | "Past" | "Unknown";
            certainty: "Unknown" | "Observed" | "Likely" | "Possible" | "Unlikely";
            area?: {
                areaDesc: string;
                polygon?: number[] | undefined;
                circle?: [number, number, number] | undefined;
                geocode?: {
                    value: string;
                    valueName: string;
                }[] | undefined;
            }[] | undefined;
            description?: string | undefined;
            effective?: string | undefined;
            onset?: string | undefined;
            expires?: string | undefined;
            senderName?: string | undefined;
            headline?: string | undefined;
            instruction?: string | undefined;
            contact?: string | undefined;
            parameter?: {
                value: string;
                valueName: string;
            }[] | undefined;
        }[];
        sent: string;
        identifier: string;
        sender: string;
        msgType: "Alert" | "Update" | "Cancel" | "Ack" | "Error";
        scope: "Public" | "Restricted" | "Private";
    }>;
    WSEvent: z.ZodObject<{
        type: z.ZodEnum<["event:new", "event:update", "alert:issued", "alert:cancelled", "alert:expired", "crowd_report:new", "crowd_report:verified", "user:location_update", "system:status"]>;
        payload: z.ZodUnknown;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "event:new" | "event:update" | "alert:issued" | "alert:cancelled" | "alert:expired" | "crowd_report:new" | "crowd_report:verified" | "user:location_update" | "system:status";
        timestamp: string;
        payload?: unknown;
    }, {
        type: "event:new" | "event:update" | "alert:issued" | "alert:cancelled" | "alert:expired" | "crowd_report:new" | "crowd_report:verified" | "user:location_update" | "system:status";
        timestamp: string;
        payload?: unknown;
    }>;
};
export type { DisasterEvent, Alert, CrowdReport, User, DispatchRecord, CapAlert, WSEvent, DisasterType, Severity, AlertStatus, Channel, SourceType, };
//# sourceMappingURL=index.d.ts.map