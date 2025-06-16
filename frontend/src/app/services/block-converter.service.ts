import { Injectable } from '@angular/core';
import { Block, BlockType, createBlock, getBlockText, toBackendBlock, fromBackendBlock } from '../models/block.model';

// Define a simple interface for page blocks (backend format)
interface PageBlock {
  type: string;
  content: string;
  checked?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BlockConverterService {

  /**
   * Convert Page Block to Editor Block
   */
  pageBlockToEditorBlock(pageBlock: PageBlock): Block {
    return fromBackendBlock(pageBlock);
  }

  /**
   * Convert Editor Block to Page Block
   */
  editorBlockToPageBlock(editorBlock: Block): PageBlock {
    return toBackendBlock(editorBlock);
  }

  /**
   * Convert array of Page Blocks to Editor Blocks
   */
  pageBlocksToEditorBlocks(pageBlocks: PageBlock[]): Block[] {
    return pageBlocks.map(block => this.pageBlockToEditorBlock(block));
  }

  /**
   * Convert array of Editor Blocks to Page Blocks
   */
  editorBlocksToPageBlocks(editorBlocks: Block[]): PageBlock[] {
    return editorBlocks.map(block => this.editorBlockToPageBlock(block));
  }

  /**
   * Create a default editor block
   */
  createDefaultEditorBlock(): Block {
    return createBlock('paragraph');
  }

  /**
   * Create a default page block
   */
  createDefaultPageBlock(): PageBlock {
    return {
      type: 'paragraph',
      content: ''
    };
  }
} 