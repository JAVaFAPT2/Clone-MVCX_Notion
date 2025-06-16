export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'heading1' 
  | 'heading2' 
  | 'todo' 
  | 'bulleted' 
  | 'bulleted_list'
  | 'numbered' 
  | 'quote' 
  | 'code' 
  | 'callout';

export interface BlockContent {
  text: string;
  marks?: Array<{
    type: string;
    data?: any;
  }>;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string | BlockContent[];
  checked?: boolean; // For todo blocks
}

export interface BackendBlock {
  id?: string;
  type: string;
  content: string;
  checked?: boolean;
}

// Type guard to check if content is string
function isStringContent(content: string | BlockContent[]): content is string {
  return typeof content === 'string';
}

// Type guard to check if a block is a backend block
function isBackendBlock(block: any): block is BackendBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    typeof block.type === 'string' &&
    typeof block.content === 'string' &&
    (block.checked === undefined || typeof block.checked === 'boolean')
  );
}

// Helper functions for block manipulation
export function createBlock(type: BlockType, content: string | BlockContent[] = '', id?: string): Block {
  return {
    id: id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    content: typeof content === 'string' ? content : content,
    checked: type === 'todo' ? false : undefined
  };
}

export function getBlockText(block: Block): string {
  if (isStringContent(block.content)) {
    return block.content;
  }
  return block.content.map(c => c.text).join('');
}

export function setBlockText(block: Block, text: string): Block {
  return {
    ...block,
    content: isStringContent(block.content) ? text : [{ text }]
  };
}

// Type guard to check if a string is a valid BlockType
export function isValidBlockType(type: string): type is BlockType {
  return [
    'paragraph', 
    'heading', 
    'heading1', 
    'heading2', 
    'todo', 
    'bulleted', 
    'bulleted_list',
    'numbered', 
    'quote', 
    'code', 
    'callout'
  ].includes(type);
}

// Convert backend block type to frontend block type
export function convertBackendBlockType(type: string): BlockType {
  const validTypes: BlockType[] = [
    'paragraph', 
    'heading', 
    'heading1', 
    'heading2', 
    'todo', 
    'bulleted', 
    'bulleted_list',
    'numbered', 
    'quote', 
    'code', 
    'callout'
  ];
  
  if (!type || !validTypes.includes(type as BlockType)) {
    console.warn(`Invalid block type: ${type}, defaulting to paragraph`);
    return 'paragraph'; // Default to paragraph for invalid types
  }
  return type as BlockType;
}

// Convert frontend block to backend block format
export function toBackendBlock(block: Block): BackendBlock {
  if (!block) {
    console.warn('Null or undefined block passed to toBackendBlock, creating default block');
    return {
      type: 'paragraph',
      content: ''
    };
  }
  
  const content = isStringContent(block.content) 
    ? block.content 
    : block.content ? block.content.map(c => c.text).join('') : '';
    
  const backendBlock: BackendBlock = {
    id: block.id && block.id.startsWith('new_') ? undefined : block.id,
    type: block.type || 'paragraph',
    content,
    checked: block.checked
  };

  return backendBlock;
}

// Convert backend block to frontend block format
export function fromBackendBlock(backendBlock: unknown): Block {
  if (!backendBlock) {
    console.warn('Null or undefined backendBlock passed to fromBackendBlock, creating default block');
    return createBlock('paragraph', '');
  }
  
  if (!isBackendBlock(backendBlock)) {
    console.warn('Invalid backend block format, creating default block', backendBlock);
    return createBlock('paragraph', '');
  }

  try {
    return createBlock(
      convertBackendBlockType(backendBlock.type),
      backendBlock.content || '',
      backendBlock.id
    );
  } catch (error) {
    console.error('Error converting backend block:', error, backendBlock);
    return createBlock('paragraph', '');
  }
} 