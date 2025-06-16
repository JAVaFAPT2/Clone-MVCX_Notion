import { Block } from './block.model';

export interface Page {
  id?: string;
  title: string;
  blocks: Block[];
  icon?: string;
  updatedAt?: Date;
  convexDocId?: string;
  linkedPageIds?: string[];
  createdBy?: string;
  lastEditedBy?: string;
  isPublic?: boolean;
  parentPageId?: string;
} 