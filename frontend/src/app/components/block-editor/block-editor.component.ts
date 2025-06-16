import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { Block, BlockType, createBlock } from '../../models/block.model';
import { BlockEditorService, BlockEditorState } from '../../services/block-editor.service';
import { TextBlockComponent } from '../blocks/text-block.component';
import { SpecialBlockComponent } from '../blocks/special-block.component';
import { SlashMenuComponent, SlashMenuItem } from './slash-menu.component';

interface BlockAction {
  action: 'newBlock' | 'deleteBlock' | 'duplicateBlock' | 'convertBlock' | 'indent' | 'outdent' | 'moveUp' | 'moveDown';
  block: Block;
  index: number;
  blockType?: BlockType;
}

@Component({
  selector: 'app-block-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag, TextBlockComponent, SpecialBlockComponent, SlashMenuComponent],
  template: `
    <div class="block-editor" (click)="onEditorClick()">
      <!-- Blocks Container with Drag and Drop -->
      <div class="blocks-container">
        <div 
          cdkDropList
          cdkDropListOrientation="vertical"
          (cdkDropListDropped)="onBlockDrop($event)"
          class="blocks-drop-list"
        >
          <div 
            *ngFor="let block of state.blocks; let i = index; trackBy: trackByBlockId"
            cdkDrag
            [cdkDragData]="block"
            class="block-wrapper"
            [class.focused]="state.focusedBlockIndex === i"
            [class.selected]="state.selectedBlocks.includes(i)"
            [class.dragging]="isDragging"
          >
            <!-- Drag Handle -->
            <div class="drag-handle" cdkDragHandle [class.visible]="state.focusedBlockIndex === i || isHovered">
              <div class="drag-indicator">
                <span class="drag-dots">⋮⋮</span>
              </div>
            </div>

            <!-- Text Blocks -->
            <app-text-block
              *ngIf="isTextBlock(block.type)"
              [block]="block"
              [index]="i"
              [isSelected]="state.selectedBlocks.includes(i)"
              (blockChange)="onBlockChange($event)"
              (blockAction)="onBlockActionEvent($event)"
              (focusChange)="onFocusChange($event)"
              (slashCommand)="onSlashCommand($event)"
              (hideSlashCommand)="onHideSlashCommand()">
            </app-text-block>

            <!-- Special Blocks -->
            <app-special-block
              *ngIf="!isTextBlock(block.type)"
              [block]="block"
              [index]="i"
              (blockChange)="onBlockChange($event)"
              (blockAction)="onBlockActionEvent($event)"
              (focusChange)="onFocusChange($event)"
            ></app-special-block>
          </div>
        </div>
        
        <!-- Add Block Button -->
        <div class="add-block-section" *ngIf="state.blocks.length === 0 || showAddButton">
          <button class="add-block-btn" (click)="addBlock('paragraph')">
            <span class="add-icon">+</span>
            <span class="add-text">Type "/" for commands</span>
          </button>
        </div>
      </div>

      <!-- Slash Menu -->
      <app-slash-menu
        [visible]="showSlashMenu"
        [position]="{ x: slashMenuPosition.left, y: slashMenuPosition.top }"
        [items]="getSlashMenuItems()"
        (itemSelected)="onSlashMenuItemSelect($event)">
      </app-slash-menu>
    </div>
  `,
  styleUrls: ['./block-editor.component.scss']
})
export class BlockEditorComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('editor') editor!: ElementRef<HTMLElement>;
  
  @Input() initialBlocks: Block[] = [];
  @Input() pageId: string | null = null;
  @Output() blocksChange = new EventEmitter<Block[]>();
  @Output() contentChange = new EventEmitter<string>();
  
  state: BlockEditorState = {
    blocks: [],
    focusedBlockIndex: null,
    selectedBlocks: [],
    clipboard: []
  };
  
  showAddButton = true;
  isDragging = false;
  isHovered = false;
  
  private subscription: Subscription = new Subscription();
  private isInternalUpdate = false;
  showSlashMenu = false;
  slashMenuPosition = { top: 0, left: 0 };
  slashMenuFilter = '';

  constructor(private blockEditorService: BlockEditorService) {}

  ngOnInit(): void {
    // Initialize with provided blocks
    if (this.initialBlocks && this.initialBlocks.length > 0) {
      this.blockEditorService.setBlocks(this.initialBlocks);
    }

    // Subscribe to state changes
    this.subscription.add(
      this.blockEditorService.getState().subscribe(state => {
        this.state = state;
        this.updateUI();
        if (!this.isInternalUpdate) {
          this.blocksChange.emit(state.blocks);
          this.contentChange.emit(this.exportContent());
        }
      })
    );

    // Initialize with default block if empty
    if (this.state.blocks.length === 0) {
      this.addBlock('paragraph');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialBlocks'] && changes['initialBlocks'].currentValue) {
      this.isInternalUpdate = true;
      this.blockEditorService.setBlocks(changes['initialBlocks'].currentValue);
      this.isInternalUpdate = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onBlockDrop(event: CdkDragDrop<Block[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      const blocks = [...this.state.blocks];
      moveItemInArray(blocks, event.previousIndex, event.currentIndex);
      this.isInternalUpdate = true;
      this.blockEditorService.setBlocks(blocks);
      this.isInternalUpdate = false;
      this.blocksChange.emit(blocks);
    }
  }

  addBlock(type: BlockType, index?: number): void {
    const newBlock = createBlock(type);
    const insertIndex = index !== undefined ? index : this.state.blocks.length;
    
    const blocks = [...this.state.blocks];
    blocks.splice(insertIndex, 0, newBlock);
    
    this.isInternalUpdate = true;
    this.blockEditorService.setBlocks(blocks);
    this.isInternalUpdate = false;
    
    // Focus the new block
    setTimeout(() => {
      this.focusBlock(insertIndex);
    }, 0);
  }

  onBlockChange(event: { block: Block; index: number }): void {
    const blocks = [...this.state.blocks];
    blocks[event.index] = event.block;
    
    this.isInternalUpdate = true;
    this.blockEditorService.setBlocks(blocks);
    this.isInternalUpdate = false;
    
    this.blocksChange.emit(blocks);
    this.contentChange.emit(this.exportContent());
  }

  onBlockAction(action: BlockAction): void {
    console.log('Block action:', action);
    
    switch (action.action) {
      case 'newBlock':
        this.addBlock('paragraph', action.index + 1);
        break;
      case 'deleteBlock':
        this.deleteBlock(action.index);
        break;
      case 'duplicateBlock':
        this.duplicateBlock(action.index);
        break;
      case 'convertBlock':
        if (action.blockType) {
          this.convertBlock(action.index, action.blockType);
        }
        break;
      case 'indent':
        this.indentBlock(action.index);
        break;
      case 'outdent':
        this.outdentBlock(action.index);
        break;
      case 'moveUp':
        this.moveBlock(action.index, action.index - 1);
        break;
      case 'moveDown':
        this.moveBlock(action.index, action.index + 1);
        break;
    }
  }

  // Handle block actions from child components
  onBlockActionEvent(event: { action: string; block: Block; index: number }): void {
    const blockAction: BlockAction = {
      action: event.action as BlockAction['action'],
      block: event.block,
      index: event.index
    };
    this.onBlockAction(blockAction);
  }

  onFocusChange(event: { focused: boolean; index: number }): void {
    if (event.focused) {
      this.state.focusedBlockIndex = event.index;
      this.state.selectedBlocks = [event.index];
    } else {
      if (this.state.focusedBlockIndex === event.index) {
        this.state.focusedBlockIndex = null;
      }
    }
  }

  updateUI(): void {
    this.showAddButton = this.state.blocks.length === 0;
  }

  onEditorClick(): void {
    // Focus the last block if no block is focused
    if (this.state.focusedBlockIndex === null && this.state.blocks.length > 0) {
      this.focusBlock(this.state.blocks.length - 1);
    }
  }

  isTextBlock(type: BlockType): boolean {
    return ['paragraph', 'heading1', 'heading2', 'heading3', 'todo', 'bulleted_list', 'numbered_list', 'quote', 'code'].includes(type);
  }

  trackByBlockId(index: number, block: Block): string {
    return block.id;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
          event.preventDefault();
          if (event.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
          break;
        case 'y':
          event.preventDefault();
          this.redo();
          break;
        case 'c':
          event.preventDefault();
          this.copySelectedBlocks();
          break;
        case 'v':
          event.preventDefault();
          this.pasteBlocks();
          break;
        case 'a':
          event.preventDefault();
          this.selectAllBlocks();
          break;
      }
    } else if (event.key === 'Delete') {
      if (this.state.selectedBlocks.length > 0) {
        event.preventDefault();
        this.deleteSelectedBlocks();
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.editor?.nativeElement.contains(event.target as Node)) {
      this.showSlashMenu = false;
    }
  }

  setBlocks(blocks: Block[]): void {
    this.blockEditorService.setBlocks(blocks);
  }

  getBlocks(): Block[] {
    return this.state.blocks;
  }

  exportContent(): string {
    return this.state.blocks.map(block => {
      if (this.isTextBlock(block.type)) {
        if (Array.isArray(block.content)) {
          return block.content.map(segment => segment.text).join('');
        }
        return '';
      }
      return `[${block.type}]`;
    }).join('\n');
  }

  importContent(content: string): void {
    // Simple import - split by lines and create paragraph blocks
    const lines = content.split('\n');
    const blocks = lines.map(line => createBlock('paragraph', line));
    this.setBlocks(blocks);
  }

  clearEditor(): void {
    this.setBlocks([]);
  }

  isEmpty(): boolean {
    return this.state.blocks.length === 0 || 
           this.state.blocks.every(block => {
             if (Array.isArray(block.content)) {
               return block.content.length === 0 || 
                      block.content.every(segment => !segment.text || segment.text.trim() === '');
             }
             return true;
           });
  }

  getBlockCount(): number {
    return this.state.blocks.length;
  }

  onSlashCommand(event: { filter: string; position: { top: number; left: number }; index: number }): void {
    this.showSlashMenu = true;
    this.slashMenuPosition = event.position;
    this.slashMenuFilter = event.filter;
  }

  onHideSlashCommand(): void {
    this.showSlashMenu = false;
  }

  getSlashMenuItems(): SlashMenuItem[] {
    return [
      { id: 'paragraph', title: 'Text', description: 'Just start writing with plain text', icon: '📝', action: 'convert', type: 'paragraph' },
      { id: 'heading1', title: 'Heading 1', description: 'Large section heading', icon: 'H1', action: 'convert', type: 'heading1' },
      { id: 'heading2', title: 'Heading 2', description: 'Medium section heading', icon: 'H2', action: 'convert', type: 'heading2' },
      { id: 'heading3', title: 'Heading 3', description: 'Small section heading', icon: 'H3', action: 'convert', type: 'heading3' },
      { id: 'todo', title: 'To-do list', description: 'Track tasks with a to-do list', icon: '☐', action: 'convert', type: 'todo' },
      { id: 'bulleted_list', title: 'Bulleted list', description: 'Create a simple bulleted list', icon: '•', action: 'convert', type: 'bulleted_list' },
      { id: 'numbered_list', title: 'Numbered list', description: 'Create a numbered list', icon: '1.', action: 'convert', type: 'numbered_list' },
      { id: 'quote', title: 'Quote', description: 'Capture a quote', icon: '"', action: 'convert', type: 'quote' },
      { id: 'code', title: 'Code', description: 'Capture a code snippet', icon: '</>', action: 'convert', type: 'code' }
    ];
  }

  onSlashMenuItemSelect(item: SlashMenuItem): void {
    this.showSlashMenu = false;
    
    // Convert current block to selected type
    if (this.state.focusedBlockIndex !== null) {
      this.convertBlock(this.state.focusedBlockIndex, item.type as BlockType);
      
      // Focus the converted block
      setTimeout(() => {
        this.focusBlock(this.state.focusedBlockIndex!);
      }, 0);
    }
  }

  // Helper methods
  private focusBlock(index: number): void {
    this.state.focusedBlockIndex = index;
    this.state.selectedBlocks = [index];
  }

  private deleteBlock(index: number): void {
    const blocks = [...this.state.blocks];
    blocks.splice(index, 1);
    
    // If no blocks left, create a default paragraph block
    if (blocks.length === 0) {
      blocks.push(createBlock('paragraph'));
    }
    
    this.isInternalUpdate = true;
    this.blockEditorService.setBlocks(blocks);
    this.isInternalUpdate = false;
    
    this.blocksChange.emit(blocks);
    
    // Focus the previous block or the first block
    const newFocusIndex = index > 0 ? index - 1 : 0;
    setTimeout(() => {
      this.focusBlock(newFocusIndex);
    }, 0);
  }

  private duplicateBlock(index: number): void {
    const blocks = [...this.state.blocks];
    const blockToDuplicate = { ...blocks[index] };
    blockToDuplicate.id = this.generateId();
    blocks.splice(index + 1, 0, blockToDuplicate);
    
    this.isInternalUpdate = true;
    this.blockEditorService.setBlocks(blocks);
    this.isInternalUpdate = false;
    
    this.blocksChange.emit(blocks);
    
    // Focus the duplicated block
    setTimeout(() => {
      this.focusBlock(index + 1);
    }, 0);
  }

  private convertBlock(index: number, newType: BlockType): void {
    const blocks = [...this.state.blocks];
    const oldBlock = blocks[index];
    // Optionally clear content for non-text blocks, or keep for text/heading
    let newContent = oldBlock.content;
    if (['heading1', 'heading2', 'heading3', 'paragraph'].includes(newType)) {
      // Keep content
      newContent = oldBlock.content;
    } else {
      // For other types, clear content
      newContent = [{ text: '' }];
    }
    blocks[index] = {
      ...oldBlock,
      type: newType,
      content: newContent,
      metadata: undefined // Optionally reset metadata
    };
    this.isInternalUpdate = true;
    this.blockEditorService.setBlocks(blocks);
    this.isInternalUpdate = false;
    this.blocksChange.emit(blocks);
    this.contentChange.emit(this.exportContent());
  }

  private indentBlock(index: number): void {
    // Implementation for indenting blocks
    console.log('Indent block', index);
  }

  private outdentBlock(index: number): void {
    // Implementation for outdenting blocks
    console.log('Outdent block', index);
  }

  private undo(): void {
    // Implementation for undo
    console.log('Undo');
  }

  private redo(): void {
    // Implementation for redo
    console.log('Redo');
  }

  private copySelectedBlocks(): void {
    // Implementation for copying blocks
    console.log('Copy blocks');
  }

  private pasteBlocks(): void {
    // Implementation for pasting blocks
    console.log('Paste blocks');
  }

  private selectAllBlocks(): void {
    this.state.selectedBlocks = this.state.blocks.map((_, index) => index);
  }

  private deleteSelectedBlocks(): void {
    // Implementation for deleting selected blocks
    console.log('Delete selected blocks');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private moveBlock(fromIndex: number, toIndex: number): void {
    // Implementation for moving blocks
    console.log('Move block from', fromIndex, 'to', toIndex);
  }
} 