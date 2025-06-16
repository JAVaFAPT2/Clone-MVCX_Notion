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

  state$: Observable<BlockEditorState> = this.stateSubject.asObservable();

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

  removeBlock(index: number): void {
    const state = this.stateSubject.value;
    if (index < 0 || index >= state.blocks.length) return;

    const newBlocks = [...state.blocks];
    newBlocks.splice(index, 1);
    
    this.stateSubject.next({
      ...state,
      blocks: newBlocks,
      focusedBlockIndex: Math.min(index, newBlocks.length - 1)
    });
  }

  updateBlock(index: number, updates: Partial<Block>): void {
    const state = this.stateSubject.value;
    if (index < 0 || index >= state.blocks.length) return;

    const newBlocks = [...state.blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    
    this.stateSubject.next({ ...state, blocks: newBlocks });
  }

  updateBlockContent(index: number, content: string): void {
    const state = this.stateSubject.value;
    if (index < 0 || index >= state.blocks.length) return;

    const newBlocks = [...state.blocks];
    newBlocks[index] = setBlockText(newBlocks[index], content);
    
    this.stateSubject.next({ ...state, blocks: newBlocks });
  }

  // Block Conversion
  convertBlock(index: number, newType: BlockType): void {
    const state = this.stateSubject.value;
    if (index < 0 || index >= state.blocks.length) return;

    const block = state.blocks[index];
    const content = getBlockText(block);
    
    const convertedBlock = createBlock(newType, content, block.id);
    
    const newBlocks = [...state.blocks];
    newBlocks[index] = convertedBlock;
    
    this.stateSubject.next({ ...state, blocks: newBlocks });
  }

  // Text Formatting
  applyFormatting(index: number, start: number, end: number, format: TextFormat): void {
    const state = this.stateSubject.value;
    const block = state.blocks[index];
    const formattedBlock = applyFormatting(block, start, end, format);
    
    this.updateBlock(index, formattedBlock);
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
    const blocksToCopy = indices
      .filter(i => i >= 0 && i < state.blocks.length)
      .map(i => state.blocks[i]);
    
    this.stateSubject.next({ ...state, clipboard: blocksToCopy });
  }

  pasteBlocks(index: number): void {
    const state = this.stateSubject.value;
    if (state.clipboard.length === 0) return;

    const newBlocks = [...state.blocks];
    const blocksToPaste = state.clipboard.map(block => createBlock(block.type, block.content));
    newBlocks.splice(index, 0, ...blocksToPaste);
    
    this.stateSubject.next({ 
      ...state, 
      blocks: newBlocks,
      focusedBlockIndex: index + blocksToPaste.length - 1
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

  clearState(): void {
    this.stateSubject.next({
      blocks: [],
      focusedBlockIndex: null,
      selectedBlocks: [],
      clipboard: []
    });
  }
} 