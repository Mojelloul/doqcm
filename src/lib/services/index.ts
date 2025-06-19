// Export des services
export { UserService } from './userService';
export { DocumentService } from './documentService';
export { QCMService } from './qcmService';
export { AIService } from './aiService';
export { ConfigService } from './configService';
export { UtilityService } from './utilityService';
export { ErrorHandler, errorHandler } from './errorHandler';
export { CacheService, cacheService } from './cacheService';
export { NotificationService, notificationService } from './notificationService';

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