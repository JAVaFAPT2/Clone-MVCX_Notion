import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block, BlockType, getBlockText as modelGetBlockText, setBlockText, createBlock } from '../../models/block.model';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BlockComponent implements AfterViewInit {
  @Input() set block(value: Block) {
    this._block = value;
    // Ensure block type is properly set
    if (this._block && !this._block.type) {
      this._block.type = 'paragraph';
    }
  }
  get block(): Block {
    return this._block;
  }
  private _block!: Block;

  @Output() update = new EventEmitter<Block>();
  @Output() remove = new EventEmitter<void>();
  @Output() addBelow = new EventEmitter<void>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();

  @ViewChild('contentInput') contentInput!: ElementRef;

  blockTypes: { type: BlockType; icon: string; label: string }[] = [
    { type: 'paragraph', icon: '¶', label: 'Paragraph' },
    { type: 'heading1', icon: 'H1', label: 'Heading 1' },
    { type: 'heading2', icon: 'H2', label: 'Heading 2' },
    { type: 'bulleted_list', icon: '•', label: 'Bulleted List' },
    { type: 'numbered', icon: '1.', label: 'Numbered List' },
    { type: 'todo', icon: '☐', label: 'To-do' },
    { type: 'quote', icon: '"', label: 'Quote' },
    { type: 'code', icon: '</>', label: 'Code' },
    { type: 'callout', icon: '💡', label: 'Callout' }
  ];

  ngAfterViewInit() {
    if (this.contentInput) {
      this.contentInput.nativeElement.focus();
    }
  }

  getBlockClass(): string {
    const classes = ['block'];
    if (this.block.type) {
      classes.push(`block-${this.block.type}`);
    }
    return classes.join(' ');
  }

  getBlockText(): string {
    return modelGetBlockText(this.block);
  }

  updateBlockText(value: string) {
    const updatedBlock = { ...this.block };
    setBlockText(updatedBlock, value);
    this.update.emit(updatedBlock);
  }

  onTypeChange(type: BlockType) {
    // Preserve the content when changing block type
    const content = this.getBlockText();
    
    // Create a new block with the selected type but keep the same content
    const newBlock = createBlock(type, content);
    
    // If it was a todo block and we're changing to another type, remove checked property
    if (type !== 'todo') {
      newBlock.checked = undefined;
    } else if (type === 'todo') {
      // Initialize checked state for new todo blocks
      newBlock.checked = false;
    }
    
    // Preserve the block ID if it exists
    if (this.block.id) {
      newBlock.id = this.block.id;
    }
    
    this.update.emit(newBlock);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addBelow.emit();
    } else if (event.key === 'Backspace' && this.getBlockText() === '') {
      event.preventDefault();
      this.remove.emit();
    }
  }

  focus() {
    if (this.contentInput?.nativeElement) {
      this.contentInput.nativeElement.focus();
    }
  }

  getPlaceholder(): string {
    switch (this._block.type) {
      case 'heading1': return 'Heading 1';
      case 'heading2': return 'Heading 2';
      case 'todo': return 'To-do';
      case 'bulleted_list': return 'List item';
      case 'numbered': return 'List item';
      case 'quote': return 'Quote';
      case 'code': return 'Code';
      case 'callout': return 'Callout';
      default: return 'Type "/" for commands';
    }
  }

  onCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const updatedBlock = { ...this.block, checked: target.checked };
    this.update.emit(updatedBlock);
  }

  onRemove() {
    this.remove.emit();
  }

  onAddBelow() {
    this.addBelow.emit();
  }
} 