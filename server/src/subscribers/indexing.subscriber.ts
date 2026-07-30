import { domainEventBus } from '../events/domainEventBus.js';
import { DomainEventType, IDomainEvent } from '../types/activity.types.js';
import { indexingService } from '../ai/services/indexing.service.js';
import { retrieverCache } from '../ai/cache/retriever.cache.js';
import { logger } from '../utils/logger.js';

export function registerIndexingSubscribers(): void {
  // Task Events
  domainEventBus.subscribe(DomainEventType.TASK_CREATED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event TASK_CREATED: ${event.aggregateId}`);
    retrieverCache.clear();
    await indexingService.indexTask(event.payload);
  });

  domainEventBus.subscribe(DomainEventType.TASK_UPDATED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event TASK_UPDATED: ${event.aggregateId}`);
    retrieverCache.clear();
    await indexingService.indexTask(event.payload);
  });

  domainEventBus.subscribe(DomainEventType.TASK_MOVED, async (event: IDomainEvent) => {
    retrieverCache.clear();
    await indexingService.indexTask(event.payload);
  });

  domainEventBus.subscribe(DomainEventType.TASK_ARCHIVED, async (event: IDomainEvent) => {
    retrieverCache.clear();
    await indexingService.indexTask(event.payload);
  });

  // Project Events
  domainEventBus.subscribe(DomainEventType.PROJECT_CREATED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event PROJECT_CREATED: ${event.aggregateId}`);
    retrieverCache.clear();
    await indexingService.indexProject(event.payload);
  });

  domainEventBus.subscribe(DomainEventType.PROJECT_UPDATED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event PROJECT_UPDATED: ${event.aggregateId}`);
    retrieverCache.clear();
    await indexingService.indexProject(event.payload);
  });

  // Comment Events
  domainEventBus.subscribe(DomainEventType.COMMENT_CREATED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event COMMENT_CREATED: ${event.aggregateId}`);
    retrieverCache.clear();
    await indexingService.indexComment(event.payload);
  });

  domainEventBus.subscribe(DomainEventType.COMMENT_UPDATED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event COMMENT_UPDATED: ${event.aggregateId}`);
    retrieverCache.clear();
    await indexingService.indexComment(event.payload);
  });

  domainEventBus.subscribe(DomainEventType.COMMENT_DELETED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event COMMENT_DELETED: ${event.aggregateId}`);
    retrieverCache.clear();
    if (event.aggregateId) {
      await indexingService.deleteCommentIndex(event.aggregateId);
    }
  });

  // File Events
  domainEventBus.subscribe(DomainEventType.FILE_UPLOADED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event FILE_UPLOADED: ${event.aggregateId}`);
    retrieverCache.clear();
    await indexingService.indexFile(event.payload);
  });

  domainEventBus.subscribe(DomainEventType.FILE_DELETED, async (event: IDomainEvent) => {
    logger.debug(`📥 [IndexingSubscriber] Event FILE_DELETED: ${event.aggregateId}`);
    retrieverCache.clear();
    if (event.aggregateId) {
      await indexingService.deleteFileIndex(event.aggregateId);
    }
  });

  logger.info('📡 [IndexingSubscriber] Domain Event Indexing subscribers registered');
}
