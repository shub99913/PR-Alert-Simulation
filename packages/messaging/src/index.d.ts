import { Channel } from '@pr-alert/schemas';
/**
 * Message template data structure
 */
export interface MessageTemplateData {
    alert: any;
    event: any;
    location: {
        lat: number;
        lon: number;
        address?: string;
        nearbyCities?: string[];
    };
    timestamp: string;
    severityLabel: string;
    disasterTypeLabel: string;
    actionGuidance: string;
    expiresAt?: string;
    capIdentifier?: string;
}
/**
 * Message output
 */
export interface GeneratedMessage {
    lang: string;
    channel: Channel;
    content: string;
    subject?: string;
    templateId: string;
    characterCount: number;
    truncated: boolean;
}
/**
 * Supported languages (Indian languages + English)
 */
export declare const SUPPORTED_LANGUAGES: readonly ["en", "hi", "bn", "te", "mr", "ta", "gu", "kn", "ml", "or", "pa", "as"];
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
/**
 * Channel character limits
 */
export declare const CHANNEL_LIMITS: Record<Channel, number>;
/**
 * CAP v1.2 XML Generator
 */
export declare class CapXmlGenerator {
    private static readonly CAP_NS;
    static generate(alert: any, options?: {
        senderId?: string;
        senderName?: string;
        language?: string;
        allLanguages?: boolean;
    }): string;
    private static buildInfoBlocks;
    private static getCategory;
    private static getEventName;
    private static truncate;
    private static getInstruction;
    private static getAreaDescription;
    private static getCityName;
    private static getStateName;
}
/**
 * Message Generator Engine
 */
export declare class MessageGenerator {
    private logger;
    constructor();
    /**
     * Generate messages for all channels and languages
     */
    generateAll(alert: any, options?: {
        languages?: SupportedLanguage[];
        channels?: Channel[];
    }): Promise<GeneratedMessage[]>;
    /**
     * Generate a single message
     */
    generate(alert: any, lang: SupportedLanguage, channel: Channel): Promise<GeneratedMessage>;
    /**
     * Build template data from alert
     */
    private buildTemplateData;
    private getLocationAddress;
    private getTemplateId;
    private generateSubject;
    private severityLabels;
    private disasterLabels;
    private getActionGuidance;
    /**
     * Get template for disaster type and channel
     */
    getTemplate(disasterType: string, channel: Channel): HandlebarsTemplateDelegate | undefined;
    /**
     * Register a custom template
     */
    registerTemplate(id: string, template: string): void;
}
/**
 * Translation service for multilingual support
 */
export declare class TranslationService {
    private static translations;
    static loadBuiltInTranslations(): void;
    static translate(key: string, lang: SupportedLanguage): string;
    static t(key: string, lang: SupportedLanguage, params?: Record<string, string>): string;
}
export { MessageGenerator, CapXmlGenerator, TranslationService, GeneratedMessage, MessageTemplateData, SupportedLanguage, SUPPORTED_LANGUAGES, CHANNEL_LIMITS, Channel, CapXmlGenerator, };
//# sourceMappingURL=index.d.ts.map