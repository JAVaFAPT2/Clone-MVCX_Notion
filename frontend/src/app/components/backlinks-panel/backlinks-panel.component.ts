import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageLinkApiService, PageLink } from '../../services/page-link-api.service';

@Component({
  selector: 'app-backlinks-panel',
  templateUrl: './backlinks-panel.component.html',
  styleUrls: ['./backlinks-panel.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BacklinksPanelComponent implements OnChanges {
  @Input() pageId!: string;

  backlinks: any[] = [];
  loading = false;

  constructor(private pageLinkApi: PageLinkApiService, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageId'] && this.pageId) {
      this.loadBacklinks();
    }
  }

  loadBacklinks() {
    this.loading = true;
    this.pageLinkApi.getBacklinkPages(this.pageId).subscribe({
      next: pages => {
        this.backlinks = pages;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openPage(id: string) {
    this.router.navigate(['/page', id]);
  }
} 