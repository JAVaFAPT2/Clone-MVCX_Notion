import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  color: string;
}

@Component({
  selector: 'app-workspace-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workspace-welcome">
      <div class="welcome-header">
        <div class="welcome-icon">📝</div>
        <h1 class="welcome-title">Welcome to your workspace</h1>
        <p class="welcome-subtitle">Get started by creating your first page or exploring templates</p>
      </div>

      <div class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <div 
            *ngFor="let action of quickActions"
            class="action-card"
            [style.border-left-color]="action.color"
            (click)="onActionClick(action)">
            <div class="action-icon" [style.background-color]="action.color">
              {{ action.icon }}
            </div>
            <div class="action-content">
              <h3 class="action-title">{{ action.title }}</h3>
              <p class="action-description">{{ action.description }}</p>
            </div>
            <div class="action-arrow">→</div>
          </div>
        </div>
      </div>

      <div class="recent-templates" *ngIf="recentTemplates.length > 0">
        <h2 class="section-title">Recent Templates</h2>
        <div class="templates-grid">
          <div 
            *ngFor="let template of recentTemplates"
            class="template-card"
            (click)="onTemplateClick(template)">
            <div class="template-icon">{{ template.icon }}</div>
            <div class="template-content">
              <h3 class="template-title">{{ template.title }}</h3>
              <p class="template-description">{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="getting-started">
        <h2 class="section-title">Getting Started</h2>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="tip-icon">💡</div>
            <h3>Use slash commands</h3>
            <p>Type "/" in any block to see available commands and block types</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">⌨️</div>
            <h3>Keyboard shortcuts</h3>
            <p>Use Ctrl+N for new page, Ctrl+/ for commands, and more</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">🔗</div>
            <h3>Link pages together</h3>
            <p>Type &#64; to link to other pages or create new ones</p>
          </div>
          <div class="tip-card">
            <div class="tip-icon">👥</div>
            <h3>Collaborate</h3>
            <p>Share pages with your team for real-time collaboration</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workspace-welcome {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .welcome-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    .welcome-title {
      font-size: 36px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 16px 0;
    }

    .welcome-subtitle {
      font-size: 18px;
      color: #666;
      margin: 0;
      max-width: 600px;
      margin: 0 auto;
    }

    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 24px 0;
    }

    .quick-actions {
      margin-bottom: 60px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border: 1px solid #e0e0e0;
      border-left: 4px solid;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    }

    .action-content {
      flex: 1;
    }

    .action-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 4px 0;
    }

    .action-description {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .action-arrow {
      font-size: 18px;
      color: #999;
      transition: transform 0.2s ease;
    }

    .action-card:hover .action-arrow {
      transform: translateX(4px);
    }

    .recent-templates {
      margin-bottom: 60px;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .template-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .template-card:hover {
      background: #f8f9fa;
      border-color: #007bff;
    }

    .template-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .template-content {
      flex: 1;
    }

    .template-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 2px 0;
    }

    .template-description {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .getting-started {
      margin-bottom: 40px;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .tip-card {
      padding: 20px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
    }

    .tip-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .tip-card h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .tip-card p {
      font-size: 14px;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .workspace-welcome {
        padding: 20px 16px;
      }

      .welcome-title {
        font-size: 28px;
      }

      .welcome-subtitle {
        font-size: 16px;
      }

      .actions-grid,
      .templates-grid,
      .tips-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WorkspaceWelcomeComponent {
  @Output() actionClick = new EventEmitter<QuickAction>();
  @Output() templateClick = new EventEmitter<any>();

  quickActions: QuickAction[] = [
    {
      id: 'new-page',
      title: 'New Page',
      description: 'Create a blank page to start writing',
      icon: '📄',
      action: 'create-page',
      color: '#007bff'
    },
    {
      id: 'new-database',
      title: 'New Database',
      description: 'Create a database to organize information',
      icon: '📊',
      action: 'create-database',
      color: '#28a745'
    },
    {
      id: 'import',
      title: 'Import Content',
      description: 'Import from Notion, Word, or other formats',
      icon: '📥',
      action: 'import',
      color: '#ffc107'
    },
    {
      id: 'template',
      title: 'Browse Templates',
      description: 'Start with a pre-made template',
      icon: '🎨',
      action: 'browse-templates',
      color: '#6f42c1'
    },
    {
      id: 'invite',
      title: 'Invite Team',
      description: 'Collaborate with your team members',
      icon: '👥',
      action: 'invite-team',
      color: '#fd7e14'
    },
    {
      id: 'tutorial',
      title: 'Take Tutorial',
      description: 'Learn the basics in 5 minutes',
      icon: '🎓',
      action: 'tutorial',
      color: '#20c997'
    }
  ];

  recentTemplates: any[] = [
    {
      id: 'meeting-notes',
      title: 'Meeting Notes',
      description: 'Template for taking meeting notes',
      icon: '📝'
    },
    {
      id: 'project-plan',
      title: 'Project Plan',
      description: 'Template for project planning',
      icon: '📋'
    },
    {
      id: 'daily-journal',
      title: 'Daily Journal',
      description: 'Template for daily journaling',
      icon: '📔'
    }
  ];

  onActionClick(action: QuickAction) {
    this.actionClick.emit(action);
  }

  onTemplateClick(template: any) {
    this.templateClick.emit(template);
  }
} 