import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Block, BlockType, TextFormat, createBlock, getBlockText, setBlockText, applyFormatting } from '../models/block.model';

export interface BlockEditorState {
  blocks: Block[];
  focusedBlockIndex: number | null;
  selectedBlocks: number[];
  clipboard: Block[];
}

@Injectable({ providedIn: 'root' })
export class BlockEditorService {
  private stateSubject = new BehaviorSubject<BlockEditorState>({
    blocks: [],
    focusedBlockIndex: null,
    selectedBlocks: [],
    clipboard: []
  });

  getState(): Observable<BlockEditorState> {
    return this.stateSubject.asObservable();
  }

  getCurrentState(): BlockEditorState {
    return this.stateSubject.value;
  }

  // Block Management
  setBlocks(blocks: Block[]): void {
    const state = this.stateSubject.value;
    this.stateSubject.next({ ...state, blocks });
  }

  addBlock(type: BlockType, index?: number, content: string = ''): void {
    const state = this.stateSubject.value;
    const newBlock = createBlock(type, content);
    const insertIndex = index ?? state.blocks.length;
    
    const newBlocks = [...state.blocks];
    newBlocks.splice(insertIndex, 0, newBlock);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: insertIndex
    });
  }

  updateBlock(block: Block, index: number): void {
    const state = this.stateSubject.value;
    const newBlocks = [...state.blocks];
    newBlocks[index] = block;
    
    this.stateSubject.next({ ...state, blocks: newBlocks });
  }

  deleteBlock(index: number): void {
    const state = this.stateSubject.value;
    const newBlocks = state.blocks.filter((_, i) => i !== index);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: null
    });
  }

  duplicateBlock(index: number): void {
    const state = this.stateSubject.value;
    const blockToDuplicate = state.blocks[index];
    const duplicatedBlock = { ...blockToDuplicate, id: createBlock(blockToDuplicate.type).id };
    
    const newBlocks = [...state.blocks];
    newBlocks.splice(index + 1, 0, duplicatedBlock);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: index + 1
    });
  }

  moveBlock(fromIndex: number, toIndex: number): void {
    const state = this.stateSubject.value;
    const newBlocks = [...state.blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: toIndex
    });
  }

  // Block Conversion
  convertBlock(index: number, newType: BlockType): void {
    const state = this.stateSubject.value;
    const block = state.blocks[index];
    const content = getBlockText(block);
    
    const convertedBlock = createBlock(newType, content, block.id);
    convertedBlock.metadata = { ...block.metadata };
    
    const newBlocks = [...state.blocks];
    newBlocks[index] = convertedBlock;
    
    this.stateSubject.next({ ...state, blocks: newBlocks });
  }

  // Text Formatting
  applyFormatting(index: number, start: number, end: number, format: TextFormat): void {
    const state = this.stateSubject.value;
    const block = state.blocks[index];
    const formattedBlock = applyFormatting(block, start, end, format);
    
    this.updateBlock(formattedBlock, index);
  }

  // Focus Management
  setFocusedBlock(index: number | null): void {
    const state = this.stateSubject.value;
    this.stateSubject.next({ ...state, focusedBlockIndex: index });
  }

  // Selection Management
  setSelectedBlocks(indices: number[]): void {
    const state = this.stateSubject.value;
    this.stateSubject.next({ ...state, selectedBlocks: indices });
  }

  // Clipboard Operations
  copyBlocks(indices: number[]): void {
    const state = this.stateSubject.value;
    const blocksToCopy = indices.map(i => state.blocks[i]);
    this.stateSubject.next({ ...state, clipboard: blocksToCopy });
  }

  cutBlocks(indices: number[]): void {
    this.copyBlocks(indices);
    const state = this.stateSubject.value;
    const newBlocks = state.blocks.filter((_, i) => !indices.includes(i));
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      selectedBlocks: [],
      focusedBlockIndex: null
    });
  }

  pasteBlocks(index: number): void {
    const state = this.stateSubject.value;
    if (state.clipboard.length === 0) return;
    
    const newBlocks = [...state.blocks];
    const pastedBlocks = state.clipboard.map(block => ({ ...block, id: createBlock(block.type).id }));
    newBlocks.splice(index, 0, ...pastedBlocks);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: index
    });
  }

  // Block Operations
  mergeBlocks(index1: number, index2: number): void {
    const state = this.stateSubject.value;
    const block1 = state.blocks[index1];
    const block2 = state.blocks[index2];
    
    const mergedContent = getBlockText(block1) + '\n' + getBlockText(block2);
    const mergedBlock = setBlockText(block1, mergedContent);
    
    const newBlocks = [...state.blocks];
    newBlocks[index1] = mergedBlock;
    newBlocks.splice(index2, 1);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: index1
    });
  }

  splitBlock(index: number, splitPosition: number): void {
    const state = this.stateSubject.value;
    const block = state.blocks[index];
    const content = getBlockText(block);
    
    const beforeContent = content.substring(0, splitPosition);
    const afterContent = content.substring(splitPosition);
    
    const beforeBlock = setBlockText(block, beforeContent);
    const afterBlock = createBlock(block.type, afterContent);
    
    const newBlocks = [...state.blocks];
    newBlocks[index] = beforeBlock;
    newBlocks.splice(index + 1, 0, afterBlock);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: index + 1
    });
  }

  // Keyboard Navigation
  moveFocus(direction: 'up' | 'down' | 'left' | 'right'): void {
    const state = this.stateSubject.value;
    if (state.focusedBlockIndex === null) return;
    
    let newIndex = state.focusedBlockIndex;
    
    switch (direction) {
      case 'up':
        newIndex = Math.max(0, state.focusedBlockIndex - 1);
        break;
      case 'down':
        newIndex = Math.min(state.blocks.length - 1, state.focusedBlockIndex + 1);
        break;
    }
    
    if (newIndex !== state.focusedBlockIndex) {
      this.setFocusedBlock(newIndex);
    }
  }

  // Undo/Redo (simplified implementation)
  private history: BlockEditorState[] = [];
  private historyIndex = -1;

  saveToHistory(): void {
    const state = this.stateSubject.value;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ ...state });
    this.historyIndex = this.history.length - 1;
    
    // Keep only last 50 states
    if (this.history.length > 50) {
      this.history = this.history.slice(-50);
      this.historyIndex = this.history.length - 1;
    }
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.stateSubject.next({ ...this.history[this.historyIndex] });
    }
  }

  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.stateSubject.next({ ...this.history[this.historyIndex] });
    }
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  // Utility Methods
  getBlockAt(index: number): Block | null {
    const state = this.stateSubject.value;
    return state.blocks[index] || null;
  }

  getBlockCount(): number {
    const state = this.stateSubject.value;
    return state.blocks.length;
  }

  isEmpty(): boolean {
    const state = this.stateSubject.value;
    return state.blocks.length === 0 || state.blocks.every(block => !getBlockText(block).trim());
  }

  // Export/Import
  exportBlocks(): string {
    const state = this.stateSubject.value;
    return JSON.stringify(state.blocks, null, 2);
  }

  importBlocks(blocksJson: string): void {
    try {
      const blocks = JSON.parse(blocksJson);
      this.setBlocks(blocks);
    } catch (error) {
      console.error('Failed to import blocks:', error);
    }
  }
} 