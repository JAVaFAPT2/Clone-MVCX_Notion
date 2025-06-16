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
    (block.checked === undefined || block.checked === null || typeof block.checked === 'boolean')
  );
}

// Helper functions for block manipulation
export function createBlock(type: BlockType, content: string | BlockContent[] = '', id?: string): Block {
  // Generate a unique ID if not provided
  const blockId = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Ensure content is properly initialized even if empty
  const blockContent = content === undefined ? '' : content;
  
  // Log block creation for debugging
  console.log('Creating block:', 'Type:', type, 'Content:', blockContent, 'ID:', blockId);
  
  return {
    id: blockId,
    type,
    content: typeof blockContent === 'string' ? blockContent : blockContent,
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
  const normalized = (type || '').toLowerCase();
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
  if (!validTypes.includes(normalized as BlockType)) {
    console.warn(`Invalid block type: ${type}, defaulting to paragraph`);
    return 'paragraph';
  }
  return normalized as BlockType;
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
  
  // Make a defensive copy of the block to avoid mutation issues
  const blockCopy = JSON.parse(JSON.stringify(block));
  
  // Handle content conversion, ensuring we always have a string even if empty
  let content = '';
  
  if (isStringContent(blockCopy.content)) {
    // If it's already a string, use it directly (even if empty)
    content = blockCopy.content || '';
  } else if (blockCopy.content) {
    // If it's an array of BlockContent, join the text values
    content = blockCopy.content.map((c: BlockContent) => c.text || '').join('');
  }
  
  // Log the conversion for debugging
  console.log('Converting block to backend format:', 
    'ID:', blockCopy.id,
    'Type:', blockCopy.type, 
    'Original content type:', typeof blockCopy.content,
    'Content length:', typeof content === 'string' ? content.length : 'N/A',
    'Content sample:', typeof content === 'string' && content.length > 50 ? 
      content.substring(0, 50) + '...' : content);
    
  const backendBlock: BackendBlock = {
    id: blockCopy.id && blockCopy.id.startsWith('new_') ? undefined : blockCopy.id,
    type: blockCopy.type || 'paragraph',
    content,
    checked: blockCopy.checked
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
    // Ensure we handle content properly, even if it's null or undefined
    const content = backendBlock.content !== undefined ? backendBlock.content : '';
    
    // Log the conversion for debugging
    console.log('Converting backend block to frontend format:', 
      'Type:', backendBlock.type, 
      'Content:', content);
    
    return createBlock(
      convertBackendBlockType(backendBlock.type),
      content,
      backendBlock.id
    );
  } catch (error) {
    console.error('Error converting backend block:', error, backendBlock);
    return createBlock('paragraph', '');
  }
} 