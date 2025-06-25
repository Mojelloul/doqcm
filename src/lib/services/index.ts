// Export des services
export * from './aiService';
export * from './cacheService';
export * from './configService';
export * from './documentService';
export * from './errorHandler';
export * from './notificationService';
export * from './qcmService';
export * from './userService';
export * from './utilityService';
export * from './subscriptionService';

// Export des types
export type { User, UserData, UserStats, UserSession, AuthData, EmailValidation } from '../types/user';
export type { Document, DocumentStats, DocumentShare, DocumentSearchParams } from '../types/document';
export type { Question, Choice, QCMScore, QCMStats, QCMValidation } from '../types/qcm';
export type { QCMGenerationResult } from './aiService';
export type { AppConfig } from './configService';
export type { AppError } from './errorHandler';
export type { CacheItem, CacheConfig } from './cacheService';
export type { Notification, NotificationType, NotificationConfig } from './notificationService';

// Export du hook
export { useServices } from '../hooks/useServices'; 