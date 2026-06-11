import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamService } from '../../core/services/team.service';
import { VoteService } from '../../core/services/vote.service';
import { SettingService } from '../../core/services/setting.service';
import { Team, Vote, Setting } from '../../core/models/api.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="teams-root">
      <!-- Header -->
      <div class="teams-header">
        <div class="header-left">
          <div class="page-eyebrow">
            <mat-icon>public</mat-icon> Global Options
          </div>
          <h1 class="page-title">Submit Selection</h1>
          <p class="page-sub">Choose your preferred entity. Each user may only cast a single active vote.</p>
        </div>

        <!-- Search -->
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            class="search-input"
            placeholder="Search by name or code..."
            (input)="onSearch($event)"
            id="teams-search">
        </div>
      </div>

      <!-- Status Banner -->
      <div *ngIf="settings() && (!settings()!.isVotingEnabled || settings()!.isResultPublished)"
           class="status-banner"
           [class.banner-locked]="settings()!.isResultPublished"
           [class.banner-closed]="!settings()!.isVotingEnabled && !settings()!.isResultPublished">
        <mat-icon>{{ settings()!.isResultPublished ? 'lock' : 'schedule' }}</mat-icon>
        <span>{{ settings()!.isResultPublished
          ? 'Selections are permanently locked — results have been published.'
          : 'Submissions are currently suspended by the administrator.' }}
        </span>
      </div>

      <!-- Active Vote Banner -->
      <div *ngIf="activeVote() && settings()?.isVotingEnabled && !settings()?.isResultPublished"
           class="active-vote-banner">
        <img [src]="activeVote()!.flagUrl" [alt]="activeVote()!.teamName" class="active-flag">
        <div style="flex: 1;">
          <div class="active-vote-label">Active Selection</div>
          <div class="active-vote-team">{{ activeVote()!.teamName }}</div>
        </div>
        <button class="btn-flat btn-flat-danger" (click)="onRevoke()">
          <mat-icon>close</mat-icon> Revoke
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="loading-state">
        <mat-spinner [diameter]="44"></mat-spinner>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredTeams().length === 0" class="empty-state">
        <mat-icon class="empty-icon">search_off</mat-icon>
        <h3>No Options Found</h3>
        <p>Try refining your search query.</p>
      </div>

      <!-- Teams Grid -->
      <div *ngIf="!isLoading() && filteredTeams().length > 0" class="teams-grid">
        <div
          *ngFor="let team of filteredTeams(); let i = index"
          class="team-card"
          [class.team-card-voted]="isCurrentVote(team.id)"
          (click)="canVote() && !isCurrentVote(team.id) && onVote(team)">

          <!-- Voted Badge -->
          <div *ngIf="isCurrentVote(team.id)" class="voted-badge">
            <mat-icon>check_circle</mat-icon> SELECTED
          </div>

          <!-- Flag -->
          <div class="team-flag-wrap">
            <img [src]="team.flagUrl" [alt]="team.teamName" class="team-flag">
            <span class="country-code-badge">{{ team.countryCode }}</span>
          </div>

          <!-- Info -->
          <div class="team-info">
            <h3 class="team-name">{{ team.teamName }}</h3>

            <!-- Action -->
            <ng-container *ngIf="settings()?.isVotingEnabled && !settings()?.isResultPublished; else voteLocked">
              <button
                *ngIf="isCurrentVote(team.id)"
                class="btn-flat btn-flat-secondary w-100"
                disabled>
                <mat-icon>check</mat-icon> Selected
              </button>
              <button
                *ngIf="!isCurrentVote(team.id) && !hasVoted()"
                class="btn-flat btn-flat-primary w-100"
                (click)="$event.stopPropagation(); onVote(team)">
                <mat-icon>how_to_vote</mat-icon> Submit
              </button>
              <button
                *ngIf="!isCurrentVote(team.id) && hasVoted()"
                class="btn-flat btn-flat-secondary w-100"
                style="color: var(--brand-primary); border-color: var(--brand-primary);"
                (click)="$event.stopPropagation(); onVote(team)">
                <mat-icon>swap_horiz</mat-icon> Switch
              </button>
            </ng-container>

            <ng-template #voteLocked>
              <button class="btn-flat btn-flat-secondary w-100" disabled style="opacity: 0.5;">
                <mat-icon>lock</mat-icon> Locked
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .teams-root {
      padding: 32px 24px 60px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .teams-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 24px;
      margin-bottom: 40px;
    }

    .page-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--brand-primary);
      margin-bottom: 12px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 8px;
    }

    .page-sub {
      color: var(--text-muted);
      font-size: 1rem;
    }

    /* Search */
    .search-wrap {
      position: relative;
      flex-shrink: 0;
      width: 100%;
      max-width: 350px;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-input {
      width: 100%;
      background-color: var(--bg-surface);
      border: 1px solid var(--bg-elevated);
      border-radius: var(--radius-md);
      padding: 14px 16px 14px 48px;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s ease;

      &::placeholder { color: var(--text-muted); }
      &:focus { border-color: var(--brand-primary); }
    }

    /* Banners */
    .status-banner {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 24px; border-radius: var(--radius-md);
      font-weight: 600; margin-bottom: 32px;
    }
    .banner-locked { background-color: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: var(--color-success); }
    .banner-closed { background-color: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: var(--color-warning); }

    .active-vote-banner {
      display: flex; align-items: center; gap: 20px;
      padding: 20px 24px; border-radius: var(--radius-lg);
      background-color: var(--bg-surface);
      border: 1px solid var(--brand-primary);
      margin-bottom: 32px;
    }

    .active-flag {
      width: 72px; height: 48px; object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--bg-elevated);
    }

    .active-vote-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--brand-primary); margin-bottom: 4px; }
    .active-vote-team { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); }

    .btn-flat-danger {
      background-color: var(--bg-base);
      color: var(--color-danger);
      border: 1px solid var(--color-danger);
      &:hover { background-color: rgba(239, 68, 68, 0.1); }
    }

    /* Loading / Empty */
    .loading-state { display: flex; justify-content: center; padding: 64px; }
    .empty-state {
      text-align: center; padding: 80px 24px;
      .empty-icon { font-size: 48px; width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px; }
      h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
      p { color: var(--text-muted); }
    }

    /* Grid */
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 24px;
    }

    .team-card {
      position: relative;
      background-color: var(--bg-surface);
      border: 1px solid var(--bg-elevated);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--brand-primary);
      }
    }

    .team-card-voted {
      border-color: var(--brand-primary) !important;
      box-shadow: 0 0 0 2px var(--brand-primary);
    }

    .voted-badge {
      position: absolute; top: 12px; left: 12px; z-index: 10;
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: var(--radius-sm);
      background-color: var(--brand-primary); color: #fff;
      font-size: 0.75rem; font-weight: 700;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .team-flag-wrap {
      position: relative; height: 160px;
      border-bottom: 1px solid var(--bg-elevated);
    }

    .team-flag { width: 100%; height: 100%; object-fit: cover; }

    .country-code-badge {
      position: absolute; bottom: 12px; right: 12px;
      padding: 4px 10px; border-radius: var(--radius-sm);
      background-color: var(--bg-base); color: var(--text-primary);
      font-size: 0.8rem; font-weight: 700;
      border: 1px solid var(--bg-elevated);
    }

    .team-info { padding: 20px; }
    .team-name { font-size: 1.15rem; font-weight: 800; margin-bottom: 16px; text-align: center; }
    .w-100 { width: 100%; }
  `]
})
export class TeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private voteService = inject(VoteService);
  private settingService = inject(SettingService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  teams = signal<Team[]>([]);
  activeVote = signal<Vote | null>(null);
  settings = signal<Setting | null>(null);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(true);

  hasVoted = computed(() => this.activeVote() !== null);
  isCurrentVote = (teamId: number) => this.activeVote()?.teamId === teamId;
  canVote = computed(() => !!this.settings()?.isVotingEnabled && !this.settings()?.isResultPublished);

  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.teams();
    return this.teams().filter(
      (t) => t.teamName.toLowerCase().includes(query) || t.countryCode.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.isLoading.set(true);
    this.settingService.getSettings().subscribe({
      next: (settingRes) => {
        if (settingRes.success && settingRes.data) this.settings.set(settingRes.data);
        this.voteService.getMyVote().subscribe({
          next: (voteRes) => {
            if (voteRes.success && voteRes.data) this.activeVote.set(voteRes.data);
            else this.activeVote.set(null);
            this.teamService.getAllTeams().subscribe({
              next: (teamRes) => {
                this.isLoading.set(false);
                if (teamRes.success && teamRes.data) this.teams.set(teamRes.data);
              },
              error: () => this.isLoading.set(false)
            });
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error loading data.', 'Close', { duration: 4000 });
      }
    });
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onVote(team: Team): void {
    const isVoteChange = this.hasVoted();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: isVoteChange ? 'Switch Selection' : 'Confirm Selection',
        message: isVoteChange
          ? `Change selection from ${this.activeVote()?.teamName} to ${team.teamName}?`
          : `Submit an official selection for ${team.teamName}?`,
        confirmText: 'Submit',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.voteService.castVote(team.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.snackBar.open(res.message, 'Close', { duration: 3000 });
              this.activeVote.set(res.data);
            } else {
              this.snackBar.open(res.message, 'Close', { duration: 4000 });
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.snackBar.open(err.message || 'Failed to submit.', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  onRevoke(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Revoke Selection',
        message: 'Remove your selection for ' + this.activeVote()?.teamName + '?',
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
