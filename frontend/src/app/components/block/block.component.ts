import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block, BlockType } from '../../models/block.model';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class BlockComponent implements AfterViewInit {
  @Input() group!: FormGroup;

  constructor(private fb: FormBuilder) {}

  // Legacy support for templates still using [block] binding (e.g., demo component)
  @Input('block') set legacyBlock(value: Block | null) {
    if (!value) return;
    // When legacy binding used, ensure reactive group reflects incoming data
    if (!this.group) {
      this.group = this.fb.group({
        id: [value.id],
        type: [value.type],
        content: [value.content],
        checked: [value.checked ?? false]
      });
    } else {
      this.group.patchValue({
        id: value.id,
        type: value.type,
        content: value.content,
        checked: value.checked ?? false,
      }, { emitEvent: false });
    }
  }

  get type(): string {
    return this.group?.get('type')?.value;
  }

  get content(): string {
    return this.group?.get('content')?.value;
  }

  get checked(): boolean {
    return this.group?.get('checked')?.value;
  }

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
    if (this.type) {
      classes.push(`block-${this.type}`);
    }
    return classes.join(' ');
  }

  onTypeChange(type: BlockType) {
    this.group.get('type')?.setValue(type);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addBelow.emit();
    }
    // Removed the backspace handler to prevent automatic block deletion
  }

  focus() {
    if (this.contentInput?.nativeElement) {
      this.contentInput.nativeElement.focus();
    }
  }

  getPlaceholder(): string {
    switch (this.type) {
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
    this.group.get('checked')?.setValue(target.checked);
  }

  onRemove() {
    this.remove.emit();
  }

  onAddBelow() {
    this.addBelow.emit();
  }

  // Legacy compatibility: expose 'block' for template logic
  get block() {
    return this.group?.value;
  }
} 