import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { BlockComponent } from '../block/block.component';
import { BacklinksPanelComponent } from '../backlinks-panel/backlinks-panel.component';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';
import { Block, BlockType, createBlock, fromBackendBlock } from '../../models/block.model';
import { Page } from '../../models/page.model';
import { PageService } from '../../services/page.service';
import { PageDraftService } from '../../services/page-draft.service';
import { BlocksFormBuilderService } from '../../services/blocks-form-builder.service';
import { BlockFormUtil } from '../../utils/block-form.util';
import { PageLinkApiService } from '../../services/page-link-api.service';
import { ThemeService } from '../../services/theme.service';

interface SlashCommand {
  type: BlockType | 'link';
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-page-editor',
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BlockComponent, BacklinksPanelComponent, EmojiPickerComponent]
})
export class PageEditorComponent implements OnInit {
  page: Page = {
    id: '',
    title: 'Untitled',
    blocks: [],
    icon: '📄'
  };

  saveInProgress = false;
  showSlashCommands = false;
  currentSlashCommandIndex = 0;
  slashCommands: SlashCommand[] = [
    { type: 'paragraph', label: 'Text', icon: '📝', description: 'Just start writing with plain text' },
    { type: 'heading', label: 'Heading 1', icon: 'H1', description: 'Big section heading' },
    { type: 'heading2', label: 'Heading 2', icon: 'H2', description: 'Medium section heading' },
    { type: 'todo', label: 'To-do list', icon: '☐', description: 'Track tasks with a to-do list' },
    { type: 'bulleted', label: 'Bulleted list', icon: '•', description: 'Create a simple bulleted list' },
    { type: 'numbered', label: 'Numbered list', icon: '1.', description: 'Create a numbered list' },
    { type: 'quote', label: 'Quote', icon: '"', description: 'Capture a quote' },
    { type: 'code', label: 'Code', icon: '</>', description: 'Capture a code snippet' },
    { type: 'callout', label: 'Callout', icon: '💡', description: 'Highlight important information' },
    { type: 'link', label: 'Page link', icon: '🔗', description: 'Insert a link to another page' }
  ];

  slashFilter = '';
  get filteredSlashCommands(): SlashCommand[] {
    if (!this.slashFilter) return this.slashCommands;
    const q = this.slashFilter.toLowerCase();
    return this.slashCommands.filter(c =>
      c.label.toLowerCase().includes(q) || c.type.includes(q)
    );
  }

  form: FormGroup = this.fb.group({
    title: [''],
    blocks: this.fb.array([])
  });

  get blocks(): FormArray<FormGroup> {
    return this.form.get('blocks') as FormArray<FormGroup>;
  }

  iconPickerVisible = false;

  constructor(
    private pageService: PageService,
    private router: Router,
    private fb: FormBuilder,
    private draftService: PageDraftService,
    private cdRef: ChangeDetectorRef,
    private blocksBuilder: BlocksFormBuilderService,
    private pageLinkApi: PageLinkApiService,
    private theme: ThemeService
  ) {}

  ngOnInit() {
    // Load page if ID is in route
    const pageId = this.router.url.split('/').pop();
    if (pageId && pageId !== 'new') {
      this.loadPage(pageId);
    } else {
      // Ensure we have at least one block for a new page
      if (this.page.blocks.length === 0) {
        this.page.blocks.push(createBlock('paragraph', ''));
      }
    }

    // react to form changes
    this.form.get('title')?.valueChanges.subscribe(title => {
      this.page.title = title ?? '';
      this.draftService.updateDraft({ title: this.page.title });
    });

    // initial blocks form array
    this.initializeBlocksForm(this.page.blocks);

    // react to form changes for blocks (mark draft dirty)
    this.blocks.valueChanges.subscribe(arr => {
      // update page.blocks snapshot for backwards compatibility
      this.page.blocks = this.blocksBuilder.toBlocks(this.blocks);
      this.draftService.updateDraft({ blocks: this.page.blocks });
    });
  }

  loadPage(id: string) {
    this.pageService.getPage(id).subscribe({
      next: (page) => {
        if (page) {
          // Ensure blocks are properly converted from backend format
          if (page.blocks && page.blocks.length > 0) {
            page.blocks = page.blocks.map(block => {
              // If the block came from the backend and doesn't have a proper format
              if (typeof block.type === 'string' && block.type.toUpperCase() === block.type) {
                return fromBackendBlock({
                  id: block.id || `block_${Date.now()}`,
                  type: block.type.toLowerCase(),
                  content: block.content || '',
                  checked: block.checked
                });
              }
              return block;
            });
          } else {
            // Ensure we have at least one block
            page.blocks = [createBlock('paragraph', '')];
          }
          this.page = page;
          this.form.patchValue({ title: this.page.title });
          this.draftService.setDraft(this.page);
          this.initializeBlocksForm(this.page.blocks);
        } else {
          console.error('Page not found');
          // Handle null page (e.g., redirect to 404 or workspace)
          this.router.navigate(['/workspace']);
        }
      },
      error: (error) => {
        console.error('Error loading page:', error);
        // Handle error (e.g., show error message)
      }
    });
  }

  onBlockUpdate(index: number, block: Block) {
    this.page.blocks[index] = block;
    this.draftService.updateDraft({ blocks: this.page.blocks });
  }

  onBlockRemove(index: number) {
    this.page.blocks.splice(index, 1);
    this.blocks.removeAt(index);
    this.draftService.updateDraft({ blocks: this.page.blocks });
  }

  onBlockAddBelow(index: number) {
    const newBlock: Block = createBlock('paragraph', '');
    this.page.blocks.splice(index + 1, 0, newBlock);
    this.blocks.insert(index + 1, BlockFormUtil.createBlockGroup(this.fb, newBlock));
    // Hide slash commands when adding a new block
    this.showSlashCommands = false;
    this.draftService.updateDraft({ blocks: this.page.blocks });
  }

  onBlockKeyDown(event: KeyboardEvent, index: number) {
    const block = this.page.blocks[index];
    const content = typeof block.content === 'string' ? block.content : block.content.map(c => c.text).join('');

    // Handle slash command
    if (event.key === '/' && content === '') {
      event.preventDefault();
      this.showSlashCommands = true;
      this.currentSlashCommandIndex = 0;
      this.slashFilter = '';
      return;
    }

    // Handle slash command navigation & filtering
    if (this.showSlashCommands) {
      if (event.key.length === 1 && event.key.match(/^[a-zA-Z0-9]$/)) {
        this.slashFilter += event.key;
        this.currentSlashCommandIndex = 0;
        return;
      }
      if (event.key === 'Backspace' && this.slashFilter.length > 0) {
        this.slashFilter = this.slashFilter.slice(0, -1);
        this.currentSlashCommandIndex = 0;
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const len = this.filteredSlashCommands.length;
        if (len) this.currentSlashCommandIndex = (this.currentSlashCommandIndex + 1) % len;
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const len = this.filteredSlashCommands.length;
        if (len) this.currentSlashCommandIndex = (this.currentSlashCommandIndex - 1 + len) % len;
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.applySlashCommand(index);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.showSlashCommands = false;
        this.slashFilter = '';
      }
    }
  }

  applySlashCommand(index: number) {
    if (!this.showSlashCommands) return;
    
    const list = this.filteredSlashCommands;
    if (list.length === 0) return;
    const command = list[this.currentSlashCommandIndex];
    // reset filter
    this.slashFilter = '';
    
    console.log('Applying slash command:', command.type, 'to block at index', index);
    
    if ((command as any).type === 'link') {
      const linkText = prompt('Enter page title to link:');
      if (linkText) {
        const blockGroup = this.blocks.at(index) as FormGroup;
        const current = blockGroup.get('content')?.value || '';
        const newContent = `${current} [[${linkText}]]`;
        blockGroup.get('content')?.setValue(newContent);
        this.page.blocks[index].content = newContent;
      }
      // Hide menu and exit
      this.showSlashCommands = false;
      return;
    }

    // For other block-type commands
    const currentContent = this.page.blocks[index]?.content || '';
    const newBlock = createBlock(command.type as BlockType, currentContent as any);
    this.page.blocks[index] = newBlock;
    this.blocks.setControl(index, BlockFormUtil.createBlockGroup(this.fb, newBlock));
    this.showSlashCommands = false;
    this.onBlockUpdate(index, newBlock);
  }

  savePage() {
    // Defer actual save to the next macrotask so the last ngModelChange
    // event (if the user just finished typing) is processed first.
    setTimeout(() => this.performSave(), 0);
  }

  private performSave() {
    // flush pending value accessors
    this.cdRef.detectChanges();
    console.log('Attempting to save page:', this.page);
    
    // Set save in progress flag
    this.saveInProgress = true;
    
    // Create a deep copy of the page FIRST to avoid modifying the original
    const pageCopy = JSON.parse(JSON.stringify(this.page));
    
    // Replace blocks from formArray to ensure latest text
    pageCopy.blocks = this.blocksBuilder.toBlocks(this.blocks);
    
    // Filter out invalid blocks before saving, but keep empty blocks
    const validBlocks = pageCopy.blocks.filter((block: any) => {
      if (!block) return false;
      if (!block.type) return false;

      // Determine the textual content of the block
      const textContent = typeof block.content === 'string'
        ? block.content
        : (block.content || []).map((c: any) => c.text || '').join('');

      // Keep block only if it has non-empty content after trimming
      return textContent.trim().length > 0;
    });

    // If all blocks were empty, add one default paragraph block
    if (validBlocks.length === 0) {
      validBlocks.push(createBlock('paragraph', ''));
    }
    
    // Use the filtered blocks in our copy
    pageCopy.blocks = validBlocks;
    console.log('Saving page with blocks:', pageCopy);
    
    if (!pageCopy.id) {
      // Create new page
      this.createNewPage(pageCopy);
    } else {
      // Update existing page
      this.updateExistingPage(pageCopy);
    }
  }
  
  private createNewPage(pageToSave: Page, retryCount = 0) {
    // Debug: Log blocks before creating page
    console.log('Creating page with blocks:', pageToSave.blocks);
    
    if (pageToSave.blocks && pageToSave.blocks.length > 0) {
      pageToSave.blocks.forEach((block, index) => {
        console.log(`Block ${index} before creating:`, 
          'ID:', block.id,
          'Type:', block.type,
          'Content:', typeof block.content === 'string' ? 
            block.content : 
            JSON.stringify(block.content)
        );
      });
    }
    
    this.pageService.createPage(pageToSave).subscribe({
      next: (createdPage) => {
        console.log('Page created successfully:', createdPage);
        this.saveInProgress = false;
        
        // Debug: Log the received page
        console.log('Received created page:', {
          id: createdPage.id,
          title: createdPage.title,
          blockCount: createdPage.blocks?.length || 0
        });
        
        // Create a deep copy to ensure no reference issues
        Object.assign(this.page, createdPage);
        this.draftService.setDraft(this.page);
        // Sync page links
        this.pageLinkApi.syncLinks(this.page.id!, this.page.blocks).subscribe();
        this.router.navigate(['/page', createdPage.id]);
      },
      error: (error) => {
        console.error('Error creating page:', error);
        this.saveInProgress = false;
        
        if (retryCount < 2) {
          console.log(`Retrying create page (attempt ${retryCount + 1})...`);
          setTimeout(() => this.createNewPage(pageToSave, retryCount + 1), 1000);
        } else {
          alert('Failed to create page. Please try again later.');
        }
      }
    });
  }
  
  private updateExistingPage(pageToSave: Page, retryCount = 0) {
    console.log('About to save page with blocks:', pageToSave.blocks);
    
    // Debug: Log content of blocks before sending
    if (pageToSave.blocks && pageToSave.blocks.length > 0) {
      pageToSave.blocks.forEach((block, index) => {
        console.log(`Block ${index} before sending:`, 
          'ID:', block.id,
          'Type:', block.type,
          'Content:', typeof block.content === 'string' ? 
            block.content : 
            JSON.stringify(block.content)
        );
      });
    }
    
    this.pageService.savePage(pageToSave).subscribe({
      next: (updatedPage) => {
        console.log('Page updated successfully:', updatedPage);
        this.saveInProgress = false;
        
        // Debug: Log the received page
        console.log('Received updated page:', {
          id: updatedPage.id,
          title: updatedPage.title,
          blockCount: updatedPage.blocks?.length || 0
        });
        
        // Only update the page reference after successful save
        // Create a deep copy to ensure no reference issues
        Object.assign(this.page, updatedPage);
        this.draftService.setDraft(this.page);
        // Sync page links
        this.pageLinkApi.syncLinks(this.page.id!, this.page.blocks).subscribe();
      },
      error: (error) => {
        console.error('Error saving page:', error);
        this.saveInProgress = false;
        
        if (retryCount < 2) {
          console.log(`Retrying save page (attempt ${retryCount + 1})...`);
          setTimeout(() => this.updateExistingPage(pageToSave, retryCount + 1), 1000);
        } else {
          alert('Failed to save page. Please try again later.');
        }
      }
    });
  }

  deletePage() {
    if (this.page.id) {
      if (confirm('Are you sure you want to delete this page?')) {
        this.pageService.deletePage(this.page.id).subscribe({
          next: () => {
            this.router.navigate(['/workspace']);
          },
          error: (error) => {
            console.error('Error deleting page:', error);
            // Handle error (e.g., show error message)
          }
        });
      }
    } else {
      this.router.navigate(['/workspace']);
    }
  }

  backToWorkspace() {
    this.router.navigate(['/workspace']);
  }

  // Handle clicking on a slash command menu item
  selectSlashCommand(commandIndex: number, blockIndex: number) {
    this.currentSlashCommandIndex = commandIndex;
    this.applySlashCommand(blockIndex);
  }

  trackByBlockId(index: number, block: Block): string {
    return block.id;
  }

  private initializeBlocksForm(blocks: Block[]) {
    this.blocks.clear();
    blocks.forEach(b => this.blocks.push(BlockFormUtil.createBlockGroup(this.fb, b)));
  }

  onIconSelected(icon: string) {
    this.page.icon = icon;
  }

  toggleDarkMode() {
    this.theme.toggle();
  }
} 