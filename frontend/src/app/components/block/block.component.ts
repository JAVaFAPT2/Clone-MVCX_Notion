import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block, BlockType, getBlockText as modelGetBlockText, setBlockText, createBlock } from '../../models/block.model';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BlockComponent {
  @Input() set block(value: Block) {
    this._block = value;
  }
  get block(): Block {
    return this._block;
  }
  private _block!: Block;

  @Output() update = new EventEmitter<Block>();
  @Output() remove = new EventEmitter<void>();
  @Output() addBelow = new EventEmitter<void>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();

  @ViewChild('contentInput') contentInput!: ElementRef<HTMLInputElement>;

  blockTypes: { type: BlockType; icon: string; label: string }[] = [
    { type: 'paragraph', icon: '📝', label: 'Text' },
    { type: 'heading', icon: 'H1', label: 'Heading 1' },
    { type: 'heading2', icon: 'H2', label: 'Heading 2' },
    { type: 'todo', icon: '☐', label: 'To-do' },
    { type: 'bulleted', icon: '•', label: 'Bullet list' },
    { type: 'numbered', icon: '1.', label: 'Numbered list' },
    { type: 'quote', icon: '"', label: 'Quote' },
    { type: 'code', icon: '</>', label: 'Code' },
    { type: 'callout', icon: '💡', label: 'Callout' }
  ];

  // Public method for template access
  getBlockText(block: Block): string {
    return modelGetBlockText(block);
  }

  onContentChange(content: string) {
    const updatedBlock = setBlockText(this._block, content);
    this.update.emit(updatedBlock);
  }

  onTypeChange(type: BlockType) {
    const updatedBlock = createBlock(type, modelGetBlockText(this._block), this._block.id);
    if (this._block.checked !== undefined) {
      updatedBlock.checked = this._block.checked;
    }
    this.update.emit(updatedBlock);
  }

  onKeyDown(event: KeyboardEvent) {
    // Handle Enter key to add new block
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addBelow.emit();
      return;
    }

    // Handle Backspace to remove empty block
    if (event.key === 'Backspace' && modelGetBlockText(this._block) === '') {
      event.preventDefault();
      this.remove.emit();
      return;
    }

    // Emit all keyboard events to parent for slash command handling
    this.keydown.emit(event);
  }

  focus() {
    if (this.contentInput?.nativeElement) {
      this.contentInput.nativeElement.focus();
    }
  }

  getBlockClass(): string {
    return `block block-${this._block.type}`;
  }

  getPlaceholder(): string {
    switch (this._block.type) {
      case 'heading': return 'Heading 1';
      case 'heading2': return 'Heading 2';
      case 'todo': return 'To-do';
      case 'bulleted': return 'List item';
      case 'numbered': return 'List item';
      case 'quote': return 'Quote';
      case 'code': return 'Code';
      case 'callout': return 'Callout';
      default: return 'Type \'/\' for commands';
    }
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this._block.checked = checkbox.checked;
    this.update.emit(this._block);
  }

  onRemove() {
    this.remove.emit();
  }

  onAddBelow() {
    this.addBelow.emit();
  }
} 