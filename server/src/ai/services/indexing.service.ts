import { chunkingService } from './chunking.service.js';
import { nomicEmbeddingProvider } from '../embeddings/nomic.embedding.js';
import { mongoDBVectorStore } from '../vector/mongodb.vector.js';
import { VectorDocument } from '../types/vector.types.js';
import { VectorDocumentModel } from '../../models/vectorDocument.model.js';
import { logger } from '../../utils/logger.js';
import { taskRepository } from '../../repositories/task.repository.js';
import { projectRepository } from '../../repositories/project.repository.js';
import { commentRepository } from '../../repositories/comment.repository.js';
import { fileRepository } from '../../repositories/file.repository.js';

export class IndexingService {
  public async indexTask(taskData: any): Promise<boolean> {
    try {
      if (!taskData || !taskData._id || !taskData.workspace) return false;

      const taskId = taskData._id.toString();
      const workspaceId = taskData.workspace.toString();
      const projectId = taskData.project ? taskData.project.toString() : undefined;

      const fullText = `Task #${taskData.taskKey}: ${taskData.title}\nStatus: ${taskData.status}, Priority: ${taskData.priority}\n${taskData.description || ''}`;

      const chunks = chunkingService.chunkText(fullText, 'TASK', taskId);
      const embeddings = await nomicEmbeddingProvider.embedDocuments(chunks.map((c) => c.content));

      const vectorDocs: VectorDocument[] = chunks.map((c, i) => ({
        id: c.chunkId,
        content: c.content,
        vector: embeddings[i],
        workspaceId,
        projectId,
        entityType: 'TASK',
        entityId: taskId,
        metadata: {
          taskKey: taskData.taskKey,
          title: taskData.title,
          status: taskData.status,
          priority: taskData.priority,
        },
      }));

      await mongoDBVectorStore.upsert(vectorDocs);
      logger.info(`✨ [IndexingService] Indexed task #${taskData.taskKey} (${vectorDocs.length} chunks)`);
      return true;
    } catch (err: any) {
      logger.warn(`⚠️ [IndexingService] Index task error: ${err?.message || String(err)}`);
      return false;
    }
  }

  public async deleteTaskIndex(taskId: string): Promise<boolean> {
    return mongoDBVectorStore.deleteByEntity(taskId);
  }

  public async indexProject(projectData: any): Promise<boolean> {
    try {
      if (!projectData || !projectData._id || !projectData.workspace) return false;

      const projectId = projectData._id.toString();
      const workspaceId = projectData.workspace.toString();

      const fullText = `Project: ${projectData.name} (${projectData.slug})\nStatus: ${projectData.status}\n${projectData.description || ''}`;

      const chunks = chunkingService.chunkText(fullText, 'PROJECT', projectId);
      const embeddings = await nomicEmbeddingProvider.embedDocuments(chunks.map((c) => c.content));

      const vectorDocs: VectorDocument[] = chunks.map((c, i) => ({
        id: c.chunkId,
        content: c.content,
        vector: embeddings[i],
        workspaceId,
        projectId,
        entityType: 'PROJECT',
        entityId: projectId,
        metadata: {
          name: projectData.name,
          slug: projectData.slug,
          status: projectData.status,
        },
      }));

      await mongoDBVectorStore.upsert(vectorDocs);
      logger.info(`✨ [IndexingService] Indexed project "${projectData.name}" (${vectorDocs.length} chunks)`);
      return true;
    } catch (err: any) {
      logger.warn(`⚠️ [IndexingService] Index project error: ${err?.message || String(err)}`);
      return false;
    }
  }

  public async deleteProjectIndex(projectId: string): Promise<boolean> {
    return mongoDBVectorStore.deleteByEntity(projectId);
  }

  public async indexComment(commentData: any): Promise<boolean> {
    try {
      if (!commentData || !commentData._id || !commentData.task) return false;

      const commentId = commentData._id.toString();
      const taskId = commentData.task.toString();

      // Retrieve parent task to resolve workspace
      const task = await taskRepository.findById(taskId);
      if (!task) return false;

      const workspaceId = task.workspace.toString();
      const projectId = task.project ? task.project.toString() : undefined;

      const fullText = `Comment on Task #${task.taskKey}: ${commentData.markdown}`;
      const chunks = chunkingService.chunkText(fullText, 'COMMENT', commentId);
      const embeddings = await nomicEmbeddingProvider.embedDocuments(chunks.map((c) => c.content));

      const vectorDocs: VectorDocument[] = chunks.map((c, i) => ({
        id: c.chunkId,
        content: c.content,
        vector: embeddings[i],
        workspaceId,
        projectId,
        entityType: 'COMMENT',
        entityId: commentId,
        metadata: {
          taskId,
          taskKey: task.taskKey,
        },
      }));

      await mongoDBVectorStore.upsert(vectorDocs);
      logger.info(`✨ [IndexingService] Indexed comment on Task #${task.taskKey}`);
      return true;
    } catch (err: any) {
      logger.warn(`⚠️ [IndexingService] Index comment error: ${err?.message || String(err)}`);
      return false;
    }
  }

  public async deleteCommentIndex(commentId: string): Promise<boolean> {
    return mongoDBVectorStore.deleteByEntity(commentId);
  }

  public async indexFile(fileData: any): Promise<boolean> {
    try {
      if (!fileData || !fileData._id || !fileData.workspace) return false;

      const fileId = fileData._id.toString();
      const workspaceId = fileData.workspace.toString();
      const projectId = fileData.project ? fileData.project.toString() : undefined;

      const fullText = `File Attachment: ${fileData.displayName} (${fileData.mimeType})\nOriginal Name: ${fileData.originalName}`;
      const chunks = chunkingService.chunkText(fullText, 'FILE', fileId);
      const embeddings = await nomicEmbeddingProvider.embedDocuments(chunks.map((c) => c.content));

      const vectorDocs: VectorDocument[] = chunks.map((c, i) => ({
        id: c.chunkId,
        content: c.content,
        vector: embeddings[i],
        workspaceId,
        projectId,
        entityType: 'FILE',
        entityId: fileId,
        metadata: {
          displayName: fileData.displayName,
          mimeType: fileData.mimeType,
          url: fileData.url,
        },
      }));

      await mongoDBVectorStore.upsert(vectorDocs);
      logger.info(`✨ [IndexingService] Indexed file "${fileData.displayName}"`);
      return true;
    } catch (err: any) {
      logger.warn(`⚠️ [IndexingService] Index file error: ${err?.message || String(err)}`);
      return false;
    }
  }

  public async deleteFileIndex(fileId: string): Promise<boolean> {
    return mongoDBVectorStore.deleteByEntity(fileId);
  }

  public async rebuildWorkspaceIndex(workspaceId: string): Promise<{ indexedTasks: number; indexedProjects: number; indexedFiles: number }> {
    logger.info(`🔄 [IndexingService] Rebuilding full workspace index for: ${workspaceId}`);

    const [projects, files] = await Promise.all([
      projectRepository.findWorkspaceProjects(workspaceId),
      fileRepository.findByWorkspaceId(workspaceId, 100),
    ]);

    let indexedTasks = 0;
    let indexedProjects = 0;
    let indexedFiles = 0;

    for (const project of projects) {
      await this.indexProject(project);
      indexedProjects++;

      const tasks = await taskRepository.findProjectTasks(project._id);
      for (const task of tasks) {
        await this.indexTask(task);
        indexedTasks++;
      }
    }

    for (const file of files) {
      await this.indexFile(file);
      indexedFiles++;
    }

    logger.info(`✅ [IndexingService] Rebuild completed: ${indexedProjects} projects, ${indexedTasks} tasks, ${indexedFiles} files`);
    return { indexedTasks, indexedProjects, indexedFiles };
  }

  public async getStatistics(workspaceId?: string) {
    try {
      const filter: Record<string, unknown> = {};
      if (workspaceId) filter.workspace = workspaceId;

      const totalChunks = await VectorDocumentModel.countDocuments(filter).exec();
      const entityTypes = await VectorDocumentModel.distinct('entityType', filter).exec();

      return {
        workspaceId: workspaceId || 'ALL',
        totalChunksIndexed: totalChunks,
        entityTypesCount: entityTypes.length,
        entityTypes,
        provider: nomicEmbeddingProvider.name,
      };
    } catch {
      return {
        workspaceId: workspaceId || 'ALL',
        totalChunksIndexed: 0,
        entityTypesCount: 0,
        entityTypes: [],
        provider: nomicEmbeddingProvider.name,
      };
    }
  }
}

export const indexingService = new IndexingService();
