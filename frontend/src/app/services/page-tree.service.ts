import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PageNode {
  id: string;
  title: string;
  parentId?: string;
  children?: PageNode[];
  icon?: string;
}

@Injectable({ providedIn: 'root' })
export class PageTreeService {
  constructor(private http: HttpClient) {}

  getAllPages(): Observable<PageNode[]> {
    return this.http.get<PageNode[]>('/api/pages');
  }

  createPage(page: Partial<PageNode>): Observable<PageNode> {
    return this.http.post<PageNode>('/api/pages', page);
  }

  updatePage(id: string, page: Partial<PageNode>): Observable<PageNode> {
    return this.http.put<PageNode>(`/api/pages/${id}`, page);
  }

  deletePage(id: string): Observable<void> {
    return this.http.delete<void>(`/api/pages/${id}`);
  }

  movePage(id: string, newParentId: string | null, newOrder: number): Observable<PageNode> {
    return this.http.put<PageNode>(`/api/pages/${id}/move`, {
      newParentId,
      newOrder
    });
  }

  updateOrder(id: string, newOrder: number): Observable<PageNode> {
    return this.http.put<PageNode>(`/api/pages/${id}/order`, newOrder);
  }

  // Utility: Build a tree from a flat list
  buildTree(pages: PageNode[]): PageNode[] {
    const idMap = new Map<string, PageNode>();
    const roots: PageNode[] = [];
    pages.forEach(page => {
      idMap.set(page.id, { ...page, children: [] });
    });
    idMap.forEach(page => {
      if (page.parentId && idMap.has(page.parentId)) {
        idMap.get(page.parentId)!.children!.push(page);
      } else {
        roots.push(page);
      }
    });
    return roots;
  }
} 