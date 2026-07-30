import { searchComments } from '../tools/comment.tools.js';

export class CommentRetriever {
  public async retrieve(taskId: string): Promise<string> {
    const comments = await searchComments(taskId, undefined, 5);
    if (comments.length === 0) return 'No comments found for this task';
    return `Comments (${comments.length}): ` + comments.map((c) => `${c.author}: "${c.markdown}"`).join(' | ');
  }
}

export const commentRetriever = new CommentRetriever();
