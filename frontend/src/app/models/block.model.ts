export type BlockType = 
  | 'paragraph' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'todo' 
  | 'bulleted_list' 
  | 'numbered_list' 
  | 'table' 
  | 'image' 
  | 'quote' 
  | 'divider' 
  | 'code' 
  | 'callout'
  | 'toggle'
  | 'embed';

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string;
  color?: string;
}

export interface TextSegment {
  text: string;
  format?: TextFormat;
}

export interface Block {
  id: string;
  type: BlockType;
  content: TextSegment[];
  metadata?: BlockMetadata;
  children?: Block[];
  parentId?: string;
  order?: number;
}

export interface BlockMetadata {
  checked?: boolean; // for todo blocks
  collapsed?: boolean; // for toggle blocks
  language?: string; // for code blocks
  url?: string; // for embed blocks
  caption?: string; // for image blocks
  columns?: number; // for table blocks
  rows?: number; // for table blocks
  tableData?: string[][]; // for table blocks
  icon?: string; // for callout blocks
  color?: string; // for callout blocks
}

export interface BlockAction {
  type: 'move' | 'duplicate' | 'delete' | 'convert' | 'add_above' | 'add_below';
  blockId: string;
  targetIndex?: number;
  newType?: BlockType;
}

export interface BlockMenuOption {
  label: string;
  icon: string;
  action: BlockAction;
  shortcut?: string;
}

export const BLOCK_MENU_OPTIONS: Record<BlockType, BlockMenuOption[]> = {
  paragraph: [
    { label: 'Convert to Heading 1', icon: 'H1', action: { type: 'convert', blockId: '', newType: 'heading1' } },
    { label: 'Convert to Heading 2', icon: 'H2', action: { type: 'convert', blockId: '', newType: 'heading2' } },
    { label: 'Convert to Heading 3', icon: 'H3', action: { type: 'convert', blockId: '', newType: 'heading3' } },
    { label: 'Convert to Bulleted List', icon: '•', action: { type: 'convert', blockId: '', newType: 'bulleted_list' } },
    { label: 'Convert to Numbered List', icon: '1.', action: { type: 'convert', blockId: '', newType: 'numbered_list' } },
    { label: 'Convert to Todo', icon: '☐', action: { type: 'convert', blockId: '', newType: 'todo' } },
    { label: 'Convert to Quote', icon: '"', action: { type: 'convert', blockId: '', newType: 'quote' } },
    { label: 'Convert to Code', icon: '</>', action: { type: 'convert', blockId: '', newType: 'code' } },
  ],
  heading1: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Heading 2', icon: 'H2', action: { type: 'convert', blockId: '', newType: 'heading2' } },
    { label: 'Convert to Heading 3', icon: 'H3', action: { type: 'convert', blockId: '', newType: 'heading3' } },
  ],
  heading2: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Heading 1', icon: 'H1', action: { type: 'convert', blockId: '', newType: 'heading1' } },
    { label: 'Convert to Heading 3', icon: 'H3', action: { type: 'convert', blockId: '', newType: 'heading3' } },
  ],
  heading3: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Heading 1', icon: 'H1', action: { type: 'convert', blockId: '', newType: 'heading1' } },
    { label: 'Convert to Heading 2', icon: 'H2', action: { type: 'convert', blockId: '', newType: 'heading2' } },
  ],
  todo: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Bulleted List', icon: '•', action: { type: 'convert', blockId: '', newType: 'bulleted_list' } },
  ],
  bulleted_list: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Numbered List', icon: '1.', action: { type: 'convert', blockId: '', newType: 'numbered_list' } },
    { label: 'Convert to Todo', icon: '☐', action: { type: 'convert', blockId: '', newType: 'todo' } },
  ],
  numbered_list: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Bulleted List', icon: '•', action: { type: 'convert', blockId: '', newType: 'bulleted_list' } },
    { label: 'Convert to Todo', icon: '☐', action: { type: 'convert', blockId: '', newType: 'todo' } },
  ],
  table: [
    { label: 'Add Row Above', icon: '↑', action: { type: 'add_above', blockId: '' } },
    { label: 'Add Row Below', icon: '↓', action: { type: 'add_below', blockId: '' } },
    { label: 'Delete Table', icon: '🗑️', action: { type: 'delete', blockId: '' } },
  ],
  image: [
    { label: 'Add Caption', icon: '📝', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Replace Image', icon: '🔄', action: { type: 'convert', blockId: '', newType: 'image' } },
    { label: 'Delete Image', icon: '🗑️', action: { type: 'delete', blockId: '' } },
  ],
  quote: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Callout', icon: '💡', action: { type: 'convert', blockId: '', newType: 'callout' } },
  ],
  divider: [
    { label: 'Delete Divider', icon: '🗑️', action: { type: 'delete', blockId: '' } },
  ],
  code: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
  ],
  callout: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Convert to Quote', icon: '"', action: { type: 'convert', blockId: '', newType: 'quote' } },
  ],
  toggle: [
    { label: 'Convert to Paragraph', icon: '¶', action: { type: 'convert', blockId: '', newType: 'paragraph' } },
    { label: 'Toggle Collapse', icon: '▼', action: { type: 'convert', blockId: '', newType: 'toggle' } },
  ],
  embed: [
    { label: 'Edit URL', icon: '🔗', action: { type: 'convert', blockId: '', newType: 'embed' } },
    { label: 'Delete Embed', icon: '🗑️', action: { type: 'delete', blockId: '' } },
  ],
};

export const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  paragraph: 'Type "/" for commands',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  todo: 'To-do',
  bulleted_list: 'List item',
  numbered_list: 'List item',
  table: 'Table',
  image: 'Image',
  quote: 'Quote',
  divider: '',
  code: 'Code',
  callout: 'Callout',
  toggle: 'Toggle',
  embed: 'Embed URL',
};

export const BLOCK_ICONS: Record<BlockType, string> = {
  paragraph: '¶',
  heading1: 'H1',
  heading2: 'H2',
  heading3: 'H3',
  todo: '☐',
  bulleted_list: '•',
  numbered_list: '1.',
  table: '⊞',
  image: '🖼️',
  quote: '"',
  divider: '—',
  code: '</>',
  callout: '💡',
  toggle: '▼',
  embed: '🔗',
};

export function createBlock(type: BlockType, content: string = '', id?: string): Block {
  return {
    id: id || generateId(),
    type,
    content: [{ text: content }],
    metadata: getDefaultMetadata(type),
    children: [],
    order: 0,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getDefaultMetadata(type: BlockType): BlockMetadata {
  switch (type) {
    case 'todo':
      return { checked: false };
    case 'toggle':
      return { collapsed: false };
    case 'code':
      return { language: 'javascript' };
    case 'table':
      return { columns: 2, rows: 2, tableData: [['', ''], ['', '']] };
    case 'callout':
      return { icon: '💡', color: 'blue' };
    case 'embed':
      return { url: '' };
    default:
      return {};
  }
}

export function getBlockText(block: Block): string {
  if (Array.isArray(block.content)) {
    return block.content.map(segment => typeof segment === 'string' ? segment : segment.text).join('');
  }
  if (typeof block.content === 'string') {
    return block.content;
  }
  return '';
}

export function setBlockText(block: Block, text: string): Block {
  return {
    ...block,
    content: [{ text }]
  };
}

export function applyFormatting(block: Block, start: number, end: number, format: TextFormat): Block {
  const text = getBlockText(block);
  const before = text.substring(0, start);
  const selected = text.substring(start, end);
  const after = text.substring(end);

  const newContent: TextSegment[] = [];
  
  if (before) {
    newContent.push({ text: before });
  }
  
  newContent.push({ text: selected, format });
  
  if (after) {
    newContent.push({ text: after });
  }

  return {
    ...block,
    content: newContent
  };
} 