import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { SettingService } from '../../core/services/setting.service';
import { Setting } from '../../core/models/api.models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="landing-root">
      
      <!-- HERO SECTION (Solid Matte) -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="dot"></span>
            {{ statusText() }}
          </div>
          
          <h1 class="hero-title">
            Global Voting<br>
            <span class="hero-title-accent">Ecosystem</span>
          </h1>
          
          <p class="hero-subtitle">
            The secure, flat-design voting platform. Cast your vote, track live analytics, and view results with absolute transparency.
          </p>

          <div class="hero-cta-group">
            <ng-container *ngIf="authService.isAuthenticated(); else authButtons">
              <a routerLink="/dashboard" class="btn-flat btn-flat-primary">
                <mat-icon>dashboard</mat-icon> Go to Dashboard
              </a>
              <a routerLink="/teams" class="btn-flat btn-flat-secondary">
                <mat-icon>public</mat-icon> View Entities
              </a>
            </ng-container>
            <ng-template #authButtons>
              <a routerLink="/login" class="btn-flat btn-flat-primary">
                <mat-icon>login</mat-icon> Sign In
              </a>
              <a routerLink="/register" class="btn-flat btn-flat-secondary">
                <mat-icon>person_add</mat-icon> Create Account
              </a>
            </ng-template>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-num">12</div>
              <div class="stat-label">Options</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">1</div>
              <div class="stat-label">Vote Per User</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">Live</div>
              <div class="stat-label">Analytics</div>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS (Flat Cards) -->
      <section class="how-section">
        <div class="section-header">
          <div class="section-eyebrow">WORKFLOW</div>
          <h2 class="section-title">How It Works</h2>
        </div>

        <div class="how-grid">
          <div class="how-card">
            <div class="how-icon bg-blue"><mat-icon>how_to_reg</mat-icon></div>
            <h3>1. Register</h3>
            <p>Create a secure account to verify your identity and ensure unique voting rights.</p>
          </div>
          <div class="how-card">
            <div class="how-icon bg-emerald"><mat-icon>how_to_vote</mat-icon></div>
            <h3>2. Vote</h3>
            <p>Browse options and cast a single vote. You can change it anytime before the deadline.</p>
          </div>
          <div class="how-card">
            <div class="how-icon bg-amber"><mat-icon>insights</mat-icon></div>
            <h3>3. Analyze</h3>
            <p>View published standings and metrics once the administration reveals the results.</p>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="landing-footer">
        <div class="footer-logo">
          <mat-icon>assessment</mat-icon>
          <span>Global <span>POLLS</span></span>
        </div>
        <p>© 2026 Global Polling Platform. Built with .NET Core & Angular.</p>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .landing-root {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 64px);
    }

    /* === HERO SECTION === */
    .hero-section {
      padding: 100px 24px;
      text-align: center;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--bg-elevated);
      display: flex;
      justify-content: center;
    }

    .hero-content {
      max-width: 800px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: var(--radius-xl);
      background-color: var(--bg-elevated);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 24px;

      .dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background-color: var(--color-success);
      }
    }

    .hero-title {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .hero-title-accent {
      color: var(--brand-primary);
    }

    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto 32px;
    }

    .hero-cta-group {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 60px;
      flex-wrap: wrap;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
    }

    .stat-item {
      text-align: center;
    }

    .stat-num {
      font-family: 'Outfit', sans-serif;
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* === HOW SECTION === */
    .how-section {
      padding: 80px 24px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .section-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .section-eyebrow {
      color: var(--brand-primary);
      font-weight: 700;
      font-size: 0.8rem;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 2.2rem;
      font-weight: 800;
    }

    .how-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .how-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--bg-elevated);
      border-radius: var(--radius-lg);
      padding: 32px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--brand-primary);
      }

      h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; }
      p { color: var(--text-muted); margin: 0; }
    }

    .how-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
      mat-icon { color: #fff; }
    }

    .bg-blue { background-color: var(--brand-primary); }
    .bg-emerald { background-color: var(--color-success); }
    .bg-amber { background-color: var(--color-warning); }

    /* === FOOTER === */
    .landing-footer {
      text-align: center;
      padding: 40px 24px;
      border-top: 1px solid var(--bg-elevated);
      background-color: var(--bg-surface);

      .footer-logo {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.2rem;
        margin-bottom: 12px;
        span span { color: var(--brand-primary); }
        mat-icon { color: var(--brand-primary); }
      }

      p { color: var(--text-muted); font-size: 0.85rem; margin: 0; }
    }
  `]
})
export class LandingComponent implements OnInit {
  authService = inject(AuthService);
  private settingService = inject(SettingService);

  settings = signal<Setting | null>(null);
  statusText = signal<string>('System Status Loading...');

  ngOnInit(): void {
    this.settingService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.settings.set(res.data);
          this.updateStatus(res.data);
        }
      },
      error: () => {
        this.statusText.set('Offline');
      }
    });
  }

  private updateStatus(settings: Setting): void {
    if (settings.isResultPublished) {
      this.statusText.set('Final Standings Published');
    } else if (settings.isVotingEnabled) {
      this.statusText.set('Voting is Open & Live');
    } else {
      this.statusText.set('Voting is Currently Closed');
    }
  }
}
