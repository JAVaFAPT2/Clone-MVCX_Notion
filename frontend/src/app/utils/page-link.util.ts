import { Block } from '../models/block.model';

/**
 * Extracts page link tokens of the form [[Page Title]] from a text string.
 * Returns an array of unique, trimmed page titles/IDs (case-sensitive).
 */
export function extractPageLinks(text: string): string[] {
  if (!text) return [];
  const regex = /\[\[([^\]]{1,100})\]\]/g; // capture text inside double brackets
  const results: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const title = match[1].trim();
    if (title && !results.includes(title)) {
      results.push(title);
    }
  }
  return results;
}

/**
 * Convenience: extract links from an entire page block array
 */
export function extractLinksFromBlocks(blocks: Block[]): string[] {
  const set = new Set<string>();
  for (const blk of blocks) {
    if (!blk) continue;
    const contentStr = typeof blk.content === 'string'
      ? blk.content
      : (blk.content || []).map((c: any) => c.text || '').join(' ');
    extractPageLinks(contentStr).forEach(l => set.add(l));
  }
  return Array.from(set);
} 