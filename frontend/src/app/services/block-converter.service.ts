import { Injectable } from '@angular/core';
import { Block, BlockType, createBlock, getBlockText } from '../models/block.model';

// Define a simple interface for page blocks (backend format)
interface PageBlock {
  type: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlockConverterService {

  /**
   * Convert Page Block to Editor Block
   */
  pageBlockToEditorBlock(pageBlock: PageBlock): Block {
    return {
      id: pageBlock.type + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: pageBlock.type as BlockType,
      content: [{ text: pageBlock.content || '' }],
      metadata: this.extractMetadata(pageBlock),
      children: [],
      order: 0
    };
  }

  /**
   * Convert Editor Block to Page Block
   */
  editorBlockToPageBlock(editorBlock: Block): PageBlock {
    return {
      type: editorBlock.type,
      content: getBlockText(editorBlock)
    };
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
   * Extract metadata from page block content
   */
  private extractMetadata(pageBlock: PageBlock): any {
    const metadata: any = {};
    
    // Extract todo checked state
    if (pageBlock.type === 'todo') {
      const content = pageBlock.content || '';
      metadata.checked = content.startsWith('[x]') || content.startsWith('[X]');
    }
    
    // Extract toggle collapsed state
    if (pageBlock.type === 'toggle') {
      const content = pageBlock.content || '';
      metadata.collapsed = content.startsWith('▼') || content.startsWith('▶');
    }
    
    return metadata;
  }

  /**
   * Create a default editor block
   */
  createDefaultEditorBlock(): Block {
    return createBlock('paragraph', '');
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