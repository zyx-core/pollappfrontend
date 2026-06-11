import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { VoteService } from '../../core/services/vote.service';
import { SettingService } from '../../core/services/setting.service';
import { Vote, Setting } from '../../core/models/api.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="dash-root">

      <!-- Hero Greeting (Solid Matte) -->
      <div class="dash-hero">
        <div class="dash-hero-content">
          <div class="greeting-eyebrow">
            <span class="dot-live"></span>
            Global Polling Platform
          </div>
          <h1 class="greeting-title">
            Welcome back, <span class="greeting-name">{{ (authService.currentUser()?.name?.split(' ') ?? [''])[0] }}</span>!
          </h1>
          <p class="greeting-sub">Track your selection, follow live standings, and monitor the ecosystem.</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="loading-state">
        <mat-spinner [diameter]="44"></mat-spinner>
      </div>

      <div *ngIf="!isLoading()" class="dash-content">

        <!-- Results Published Banner -->
        <div *ngIf="settings()?.isResultPublished" class="results-banner">
          <div class="results-banner-icon"><mat-icon>emoji_events</mat-icon></div>
          <div class="results-banner-text">
            <div class="results-banner-title">Final Standings Published</div>
            <div class="results-banner-sub">The voting period has concluded. View the official outcomes now.</div>
          </div>
          <a routerLink="/results" class="btn-flat btn-flat-primary">
            <mat-icon>leaderboard</mat-icon> View Results
          </a>
        </div>

        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon-wrap bg-blue"><mat-icon>how_to_vote</mat-icon></div>
            <div class="stat-value">{{ activeVote() ? activeVote()!.teamName : 'None' }}</div>
            <div class="stat-label">Active Selection</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap" [class.bg-emerald]="settings()?.isVotingEnabled" [class.bg-amber]="!settings()?.isVotingEnabled">
              <mat-icon>{{ settings()?.isVotingEnabled ? 'lock_open' : 'lock' }}</mat-icon>
            </div>
            <div class="stat-value" [class.text-emerald]="settings()?.isVotingEnabled" [class.text-amber]="!settings()?.isVotingEnabled">
              {{ settings()?.isVotingEnabled ? 'Open' : 'Closed' }}
            </div>
            <div class="stat-label">Voting Window</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap" [class.bg-emerald]="settings()?.isResultPublished" [class.bg-slate]="!settings()?.isResultPublished">
              <mat-icon>{{ settings()?.isResultPublished ? 'visibility' : 'visibility_off' }}</mat-icon>
            </div>
            <div class="stat-value" [class.text-emerald]="settings()?.isResultPublished" [class.text-muted]="!settings()?.isResultPublished">
              {{ settings()?.isResultPublished ? 'Published' : 'Hidden' }}
            </div>
            <div class="stat-label">Results State</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap bg-slate"><mat-icon>person</mat-icon></div>
            <div class="stat-value">{{ authService.currentUser()?.role }}</div>
            <div class="stat-label">Account Role</div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="dash-grid">

          <!-- Vote Card -->
          <div class="dash-card">
            <div class="dash-card-header">
              <div class="dash-card-icon bg-blue"><mat-icon>assessment</mat-icon></div>
              <div>
                <div class="dash-card-title">Your Selection</div>
                <div class="dash-card-sub">Current active choice</div>
              </div>
            </div>

            <!-- Has Vote -->
            <div *ngIf="activeVote()" class="vote-display">
              <div class="vote-flag-wrap">
                <img [src]="activeVote()!.flagUrl" [alt]="activeVote()!.teamName" class="vote-flag">
              </div>
              <div class="vote-team-name">{{ activeVote()!.teamName }}</div>
              <div class="vote-meta">
                <mat-icon>schedule</mat-icon>
                Voted {{ activeVote()!.votedAt | date:'medium' }}
              </div>
            </div>

            <!-- No Vote -->
            <div *ngIf="!activeVote()" class="no-vote">
              <mat-icon class="no-vote-icon">how_to_vote</mat-icon>
              <div class="no-vote-title">No Selection Made</div>
              <p class="no-vote-sub">Browse the options and submit your official vote.</p>
            </div>

            <!-- Actions -->
            <div class="dash-card-actions">
              <ng-container *ngIf="settings()?.isVotingEnabled && !settings()?.isResultPublished">
                <a *ngIf="!activeVote()" routerLink="/teams" class="btn-flat btn-flat-primary w-100">
                  <mat-icon>how_to_vote</mat-icon> Cast Vote
                </a>
                <div *ngIf="activeVote()" class="action-row">
                  <a routerLink="/teams" class="btn-flat btn-flat-primary flex-1">
                    <mat-icon>swap_horiz</mat-icon> Change
                  </a>
                  <button class="btn-flat btn-flat-danger flex-1" (click)="onRevoke()">
                    <mat-icon>close</mat-icon> Revoke
                  </button>
                </div>
              </ng-container>
              <div *ngIf="!settings()?.isVotingEnabled && !settings()?.isResultPublished" class="action-notice warning">
                <mat-icon>schedule</mat-icon> Voting window is currently suspended.
              </div>
              <div *ngIf="settings()?.isResultPublished" class="action-notice success">
                <mat-icon>lock</mat-icon> Voting is locked — outcomes are finalized.
              </div>
            </div>
          </div>

          <!-- System Info Card -->
          <div class="dash-card">
            <div class="dash-card-header">
              <div class="dash-card-icon bg-slate"><mat-icon>info</mat-icon></div>
              <div>
                <div class="dash-card-title">System Information</div>
                <div class="dash-card-sub">Platform metrics and details</div>
              </div>
            </div>

            <div class="info-list">
              <div class="info-row">
                <span class="info-key">Voting Access</span>
                <span class="info-val" [class.text-emerald]="settings()?.isVotingEnabled" [class.text-amber]="!settings()?.isVotingEnabled">
                  {{ settings()?.isVotingEnabled ? 'Open' : 'Closed' }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-key">Results Visibility</span>
                <span class="info-val" [class.text-emerald]="settings()?.isResultPublished">
                  {{ settings()?.isResultPublished ? 'Public' : 'Hidden' }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-key">User Identifier</span>
                <span class="info-val">{{ authService.currentUser()?.name }}</span>
              </div>
            </div>

            <div class="info-note">
              <mat-icon>encrypted</mat-icon>
              <span>Selections are securely encrypted and obscured until the administration reveals aggregate metrics.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .dash-root { min-height: calc(100vh - 64px); }

    /* === HERO === */
    .dash-hero {
      padding: 48px 32px;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--bg-elevated);
    }

    .dash-hero-content {
      max-width: 1100px;
      margin: 0 auto;
    }

    .greeting-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--color-success);
      margin-bottom: 12px;
    }

    .dot-live {
      width: 8px; height: 8px;
      border-radius: 50%;
      background-color: var(--color-success);
    }

    .greeting-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .greeting-name { color: var(--brand-primary); }

    .greeting-sub {
      color: var(--text-muted);
      font-size: 1.05rem;
      margin: 0;
    }

    /* === CONTENT === */
    .dash-content {
      padding: 32px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .loading-state {
      display: flex; justify-content: center; padding: 64px;
    }

    /* === RESULTS BANNER === */
    .results-banner {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
      border-radius: var(--radius-lg);
      background-color: var(--brand-primary);
      color: #fff;
      margin-bottom: 32px;
    }

    .results-banner-icon mat-icon { font-size: 40px; width: 40px; height: 40px; }

    .results-banner-text { flex: 1; }

    .results-banner-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin-bottom: 4px;
    }

    .results-banner-sub {
      font-size: 0.95rem;
      opacity: 0.9;
    }

    /* === STATS ROW === */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      padding: 24px;
      border-radius: var(--radius-lg);
      background-color: var(--bg-surface);
      border: 1px solid var(--bg-elevated);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-icon-wrap {
      width: 40px; height: 40px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
      mat-icon { color: #fff; }
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .bg-blue { background-color: var(--brand-primary); }
    .bg-emerald { background-color: var(--color-success); }
    .bg-amber { background-color: var(--color-warning); }
    .bg-slate { background-color: var(--bg-elevated); }

    .text-emerald { color: var(--color-success) !important; }
    .text-amber { color: var(--color-warning) !important; }

    /* === DASH CARDS === */
    .dash-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .dash-card {
      padding: 32px;
      border-radius: var(--radius-lg);
      background-color: var(--bg-surface);
      border: 1px solid var(--bg-elevated);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .dash-card-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .dash-card-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      mat-icon { color: #fff; }
    }

    .dash-card-title {
      font-size: 1.15rem;
      font-weight: 800;
    }

    .dash-card-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Vote Display */
    .vote-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
      padding: 16px 0;
    }

    .vote-flag-wrap {
      width: 160px; height: 100px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--bg-elevated);
    }

    .vote-flag {
      width: 100%; height: 100%;
      object-fit: cover;
    }

    .vote-team-name {
      font-size: 1.5rem;
      font-weight: 800;
    }

    .vote-meta {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.85rem; color: var(--text-muted);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* No Vote */
    .no-vote {
      text-align: center;
      padding: 32px 0;
    }

    .no-vote-icon { font-size: 48px; width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px; }
    .no-vote-title { font-size: 1.15rem; font-weight: 800; margin-bottom: 8px; }
    .no-vote-sub { color: var(--text-muted); font-size: 0.9rem; }

    /* Actions */
    .dash-card-actions { display: flex; flex-direction: column; gap: 12px; }
    .w-100 { width: 100%; }
    .flex-1 { flex: 1; }
    .action-row { display: flex; gap: 12px; }

    .btn-flat-danger {
      background-color: var(--bg-base);
      color: var(--color-danger);
      border: 1px solid var(--color-danger);
      &:hover { background-color: rgba(239, 68, 68, 0.1); }
    }

    .action-notice {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-radius: var(--radius-md);
      font-size: 0.9rem; font-weight: 600;
      &.warning { background-color: rgba(245,158,11,0.1); color: var(--color-warning); }
      &.success { background-color: rgba(16,185,129,0.1); color: var(--color-success); }
    }

    /* Info List */
    .info-list { display: flex; flex-direction: column; }
    .info-row {
      display: flex; justify-content: space-between; padding: 16px 0;
      border-bottom: 1px solid var(--bg-elevated);
      &:last-child { border-bottom: none; }
    }
    .info-key { color: var(--text-muted); font-size: 0.9rem; }
    .info-val { font-weight: 600; font-size: 0.9rem; }

    .info-note {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 16px; border-radius: var(--radius-md);
      background-color: var(--bg-base);
      border: 1px solid var(--bg-elevated);
      color: var(--text-muted); font-size: 0.85rem;
      mat-icon { color: var(--brand-primary); font-size: 20px; width: 20px; height: 20px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private voteService = inject(VoteService);
  private settingService = inject(SettingService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  activeVote = signal<Vote | null>(null);
  settings = signal<Setting | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.isLoading.set(true);
    this.settingService.getSettings().subscribe({
      next: (settingRes) => {
        if (settingRes.success && settingRes.data) this.settings.set(settingRes.data);
        this.voteService.getMyVote().subscribe({
          next: (voteRes) => {
            this.isLoading.set(false);
            if (voteRes.success && voteRes.data) this.activeVote.set(voteRes.data);
            else this.activeVote.set(null);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load settings.', 'Close', { duration: 4000 });
      }
    });
  }

  onRevoke(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Revoke Selection',
        message: 'Remove your selection for ' + this.activeVote()?.teamName + '? You can select again while the window is open.',
        confirmText: 'Revoke',
        cancelText: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.voteService.revokeVote().subscribe({
          next: (res) => {
            if (res.success) {
              this.snackBar.open(res.message, 'Close', { duration: 3000 });
              this.activeVote.set(null);
            } else {
              this.snackBar.open(res.message, 'Close', { duration: 4000 });
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Failed to revoke.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
}
