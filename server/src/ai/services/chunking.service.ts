export interface ChunkResult {
  chunkId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

export class ChunkingService {
  private readonly defaultChunkSizeChars = 3500; // ~850-900 tokens
  private readonly defaultOverlapChars = 700;    // ~175 tokens

  public chunkText(
    text: string,
    entityType: string,
    entityId: string,
    maxSizeChars = this.defaultChunkSizeChars,
    overlapChars = this.defaultOverlapChars
  ): ChunkResult[] {
    if (!text || text.trim().length === 0) return [];

    const cleanText = text.trim();
    if (cleanText.length <= maxSizeChars) {
      return [
        {
          chunkId: `chunk_${entityType}_${entityId}_0`,
          chunkIndex: 0,
          content: cleanText,
          tokenCount: Math.ceil(cleanText.length / 4),
        },
      ];
    }

    const chunks: ChunkResult[] = [];
    let start = 0;
    let index = 0;

    while (start < cleanText.length) {
      let end = start + maxSizeChars;
      if (end >= cleanText.length) {
        end = cleanText.length;
      } else {
        // Try to break cleanly at sentence or paragraph boundary
        const lastSpace = cleanText.lastIndexOf(' ', end);
        if (lastSpace > start + 500) {
          end = lastSpace;
        }
      }

      const chunkContent = cleanText.substring(start, end).trim();
      if (chunkContent.length > 0) {
        chunks.push({
          chunkId: `chunk_${entityType}_${entityId}_${index}`,
          chunkIndex: index,
          content: chunkContent,
          tokenCount: Math.ceil(chunkContent.length / 4),
        });
        index++;
      }

      if (end >= cleanText.length) break;
      start = end - overlapChars;
    }

    return chunks;
  }
}

export const chunkingService = new ChunkingService();
