export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: PropertyOption[];
  defaultValue?: any;
  required?: boolean;
  unique?: boolean;
  width?: number;
  order: number;
}

export type PropertyType = 
  | 'title'
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'person'
  | 'files'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone'
  | 'formula'
  | 'relation'
  | 'rollup'
  | 'created_time'
  | 'created_by'
  | 'last_edited_time'
  | 'last_edited_by';

export interface PropertyOption {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface DatabaseRecord {
  id: string;
  properties: Record<string, any>;
  createdTime: Date;
  lastEditedTime: Date;
  createdBy?: string;
  lastEditedBy?: string;
}

export interface DatabaseView {
  id: string;
  name: string;
  type: ViewType;
  visibleProperties: string[];
  sort?: SortConfig[];
  filter?: FilterConfig[];
  groupBy?: string;
  layout?: ViewLayout;
  isDefault?: boolean;
}

export type ViewType = 'table' | 'board' | 'calendar' | 'list' | 'gallery' | 'timeline';

export interface ViewLayout {
  type: ViewType;
  config?: any;
}

export interface SortConfig {
  propertyId: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  propertyId: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 
  | 'equals'
  | 'does_not_equal'
  | 'contains'
  | 'does_not_contain'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal_to'
  | 'less_than_or_equal_to'
  | 'before'
  | 'after'
  | 'on_or_before'
  | 'on_or_after'
  | 'past_week'
  | 'past_month'
  | 'past_year'
  | 'next_week'
  | 'next_month'
  | 'next_year';

export interface Database {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  cover?: string;
  properties: DatabaseProperty[];
  records: DatabaseRecord[];
  views: DatabaseView[];
  parentPageId?: string;
  createdTime: Date;
  lastEditedTime: Date;
  createdBy?: string;
  lastEditedBy?: string;
  isPublic?: boolean;
  permissions?: DatabasePermission[];
}

export interface DatabasePermission {
  userId: string;
  permission: 'read' | 'comment' | 'edit' | 'full';
}

export interface DatabaseTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  properties: DatabaseProperty[];
  sampleRecords?: DatabaseRecord[];
  category?: string;
  tags?: string[];
}

export interface DatabaseStats {
  totalRecords: number;
  totalViews: number;
  lastUpdated: Date;
  mostActiveProperty?: string;
  recordGrowth?: number;
}

export interface DatabaseExport {
  format: 'csv' | 'json' | 'xlsx';
  includeProperties: string[];
  filters?: FilterConfig[];
  sort?: SortConfig[];
}

export interface DatabaseImport {
  format: 'csv' | 'json' | 'xlsx';
  data: any[];
  propertyMapping: Record<string, string>;
  updateExisting?: boolean;
}

// Utility functions
export function createDefaultProperties(): DatabaseProperty[] {
  return [
    {
      id: 'title',
      name: 'Name',
      type: 'title',
      required: true,
      order: 0,
      width: 200
    },
    {
      id: 'created_time',
      name: 'Created time',
      type: 'created_time',
      order: 1,
      width: 150
    }
  ];
}

export function createDefaultView(databaseId: string): DatabaseView {
  return {
    id: `view_${databaseId}_table`,
    name: 'Table',
    type: 'table',
    visibleProperties: ['title', 'created_time'],
    isDefault: true
  };
}

export function createSampleDatabase(name: string, description?: string): Database {
  const id = `db_${Date.now()}`;
  return {
    id,
    name,
    description,
    icon: '📊',
    properties: createDefaultProperties(),
    records: [],
    views: [createDefaultView(id)],
    createdTime: new Date(),
    lastEditedTime: new Date(),
    createdBy: 'current-user',
    lastEditedBy: 'current-user'
  };
}

export function getPropertyTypeIcon(type: PropertyType): string {
  const icons: Record<PropertyType, string> = {
    title: '📝',
    text: '📄',
    number: '🔢',
    select: '🏷️',
    multi_select: '🏷️🏷️',
    date: '📅',
    person: '👤',
    files: '📎',
    checkbox: '☑️',
    url: '🔗',
    email: '📧',
    phone: '📞',
    formula: '🧮',
    relation: '🔗',
    rollup: '📊',
    created_time: '⏰',
    created_by: '👤',
    last_edited_time: '✏️',
    last_edited_by: '👤'
  };
  return icons[type] || '📄';
}

export function getPropertyTypeName(type: PropertyType): string {
  const names: Record<PropertyType, string> = {
    title: 'Title',
    text: 'Text',
    number: 'Number',
    select: 'Select',
    multi_select: 'Multi-select',
    date: 'Date',
    person: 'Person',
    files: 'Files',
    checkbox: 'Checkbox',
    url: 'URL',
    email: 'Email',
    phone: 'Phone',
    formula: 'Formula',
    relation: 'Relation',
    rollup: 'Rollup',
    created_time: 'Created time',
    created_by: 'Created by',
    last_edited_time: 'Last edited time',
    last_edited_by: 'Last edited by'
  };
  return names[type] || 'Unknown';
}

export function getViewTypeIcon(type: ViewType): string {
  const icons: Record<ViewType, string> = {
    table: '📊',
    board: '📋',
    calendar: '📅',
    list: '📝',
    gallery: '🖼️',
    timeline: '⏰'
  };
  return icons[type] || '📊';
}

export function getViewTypeName(type: ViewType): string {
  const names: Record<ViewType, string> = {
    table: 'Table',
    board: 'Board',
    calendar: 'Calendar',
    list: 'List',
    gallery: 'Gallery',
    timeline: 'Timeline'
  };
  return names[type] || 'Unknown';
} 