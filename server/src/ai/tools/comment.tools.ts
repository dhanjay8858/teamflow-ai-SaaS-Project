import { commentRepository } from '../../repositories/comment.repository.js';
import { ICommentDocument } from '../../types/comment.types.js';

export async function searchComments(taskId: string, query?: string, limit = 10) {
  const comments: ICommentDocument[] = await commentRepository.findTaskComments(taskId, 1, limit);
  let filtered = comments;
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((c) => c.markdown.toLowerCase().includes(q));
  }
  return filtered.map((c) => {
    const authorObj = c.author as unknown as { name?: string };
    return {
      id: c._id.toString(),
      taskId: c.task.toString(),
      author: authorObj?.name || 'Unknown',
      markdown: c.markdown,
      createdAt: c.createdAt,
    };
  });
}
