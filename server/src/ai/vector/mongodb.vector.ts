import mongoose from 'mongoose';
import {
  VectorStore,
  VectorDocument,
  VectorSearchResult,
  VectorStoreSearchFilter,
  VectorStoreHealthStatus,
} from '../types/vector.types.js';
import { VectorDocumentModel } from '../../models/vectorDocument.model.js';
import { logger } from '../../utils/logger.js';

export class MongoDBVectorStore implements VectorStore {
  public readonly name = 'mongodb';
  private inMemoryFallback = new Map<string, VectorDocument>();

  public async upsert(documents: VectorDocument[]): Promise<boolean> {
    try {
      const isMongoConnected = mongoose.connection.readyState === 1;
      if (!isMongoConnected) {
        for (const doc of documents) {
          this.inMemoryFallback.set(doc.id, doc);
        }
        return true;
      }

      const bulkOps = documents.map((doc) => ({
        updateOne: {
          filter: { chunkId: doc.id },
          update: {
            $set: {
              chunkId: doc.id,
              workspace: doc.workspaceId,
              project: doc.projectId || null,
              entityType: doc.entityType as any,
              entityId: doc.entityId,
              chunkText: doc.content,
              embedding: doc.vector || [],
              metadata: doc.metadata || {},
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      if (bulkOps.length > 0) {
        await VectorDocumentModel.bulkWrite(bulkOps);
      }
      return true;
    } catch (err: any) {
      logger.warn(`⚠️ [MongoDBVectorStore] Upsert failed, falling back to memory: ${err?.message || String(err)}`);
      for (const doc of documents) {
        this.inMemoryFallback.set(doc.id, doc);
      }
      return true;
    }
  }

  public async delete(ids: string[]): Promise<boolean> {
    try {
      for (const id of ids) {
        this.inMemoryFallback.delete(id);
      }
      if (mongoose.connection.readyState === 1) {
        await VectorDocumentModel.deleteMany({ chunkId: { $in: ids } });
      }
      return true;
    } catch {
      return false;
    }
  }

  public async deleteByEntity(entityId: string): Promise<boolean> {
    try {
      if (mongoose.connection.readyState === 1) {
        await VectorDocumentModel.deleteMany({ entityId });
      }
      for (const [key, doc] of this.inMemoryFallback.entries()) {
        if (doc.entityId === entityId) {
          this.inMemoryFallback.delete(key);
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  public async search(
    queryVector: number[],
    filter: VectorStoreSearchFilter
  ): Promise<VectorSearchResult[]> {
    const results: VectorSearchResult[] = [];

    try {
      if (mongoose.connection.readyState === 1) {
        const query: Record<string, unknown> = { workspace: filter.workspaceId };
        if (filter.projectId) query.project = filter.projectId;
        if (filter.entityType) query.entityType = filter.entityType;

        const docs = await VectorDocumentModel.find(query).limit(100).exec();

        for (const doc of docs) {
          let score = 0.85;
          if (doc.embedding && doc.embedding.length === queryVector.length) {
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;
            for (let i = 0; i < queryVector.length; i++) {
              dotProduct += queryVector[i] * doc.embedding[i];
              normA += queryVector[i] * queryVector[i];
              normB += doc.embedding[i] * doc.embedding[i];
            }
            score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
          }

          if (filter.minScore && score < filter.minScore) continue;

          results.push({
            id: doc.chunkId,
            content: doc.chunkText,
            score,
            metadata: doc.metadata || {},
            entityType: doc.entityType,
            entityId: doc.entityId,
          });
        }
      }
    } catch (err: any) {
      logger.warn(`⚠️ [MongoDBVectorStore] Search error: ${err?.message || String(err)}`);
    }

    // In-Memory Fallback entries
    for (const doc of this.inMemoryFallback.values()) {
      if (filter.workspaceId && doc.workspaceId !== filter.workspaceId) continue;
      if (filter.projectId && doc.projectId !== filter.projectId) continue;
      if (filter.entityType && doc.entityType !== filter.entityType) continue;

      let score = 0.85;
      if (doc.vector && doc.vector.length === queryVector.length) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < queryVector.length; i++) {
          dotProduct += queryVector[i] * doc.vector[i];
          normA += queryVector[i] * queryVector[i];
          normB += doc.vector[i] * doc.vector[i];
        }
        score = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
      }

      if (filter.minScore && score < filter.minScore) continue;

      results.push({
        id: doc.id,
        content: doc.content,
        score,
        metadata: doc.metadata,
        entityType: doc.entityType,
        entityId: doc.entityId,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, filter.limit || 10);
  }

  public async health(): Promise<VectorStoreHealthStatus> {
    const isMongoConnected = mongoose.connection.readyState === 1;
    return {
      store: this.name,
      status: isMongoConnected ? 'healthy' : 'unhealthy',
      message: isMongoConnected ? 'MongoDB connection active' : 'Using in-memory vector store fallback',
    };
  }
}

export const mongoDBVectorStore = new MongoDBVectorStore();
