import { Block } from './block.model';

export interface Page {
  id?: string;
  userId?: string;
  parentId?: string | null;
  order?: number;
  icon?: string;
  title?: string;
  blocks?: Block[];
  convexDocId?: string | null;
  linkedPageIds?: string[];
  backlinkPageIds?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PageNode {
  page: Page;
  children: PageNode[];
  level: number;
  isExpanded?: boolean;
}

export interface MovePageRequest {
  newParentId: string | null;
  newOrder: number;
} 