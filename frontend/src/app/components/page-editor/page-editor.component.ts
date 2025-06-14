import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageService } from '../../services/page.service';
import { Page } from '../../models/page.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-page-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit {
  pages$: Observable<Page[]> = this.pageService.getAll();
  selected?: Page;
  newTitle = '';
  newContent = '';

  constructor(private pageService: PageService) {}

  ngOnInit(): void {}

  select(page: Page) {
    this.selected = page;
    this.newTitle = page.title;
    this.newContent = page.blocks?.join('\n') ?? '';
  }

  save() {
    if (!this.selected) {
      // create
      const page: Page = {
        id: undefined,
        title: this.newTitle,
        blocks: [this.newContent],
        createdAt: undefined,
        updatedAt: undefined
      } as Page;
      this.pageService.create(page).subscribe(() => (this.pages$ = this.pageService.getAll()));
    } else {
      const updated: Page = { ...this.selected, title: this.newTitle, blocks: [this.newContent] };
      this.pageService.update(this.selected.id!, updated).subscribe(() => (this.pages$ = this.pageService.getAll()));
    }
    this.newTitle = '';
    this.newContent = '';
    this.selected = undefined;
  }

  delete(page: Page) {
    if (page.id) {
      this.pageService.delete(page.id).subscribe(() => (this.pages$ = this.pageService.getAll()));
    }
  }
} 