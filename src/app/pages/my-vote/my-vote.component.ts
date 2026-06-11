import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VoteService } from '../../core/services/vote.service';
import { SettingService } from '../../core/services/setting.service';
import { Vote, Setting } from '../../core/models/api.models';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-vote',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div style="padding: 32px 24px; max-width: 600px; margin: 0 auto; width: 100%;">
      <!-- Header -->
      <div style="margin-bottom: 40px; text-align: center;">
        <h2 style="font-size: 2.5rem; font-weight: 800; margin: 0;">My Active Selection</h2>
        <p style="color: var(--text-muted); margin: 8px 0 0 0;">Inspect your submitted record and manage your preference.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" style="display: flex; align-items: center; justify-content: center; min-height: 200px;">
        <mat-spinner [diameter]="48"></mat-spinner>
      </div>

      <div *ngIf="!isLoading()">
        
        <!-- Active Vote Details -->
        <mat-card *ngIf="activeVote(); else emptyState" 
                  style="border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--bg-elevated); box-shadow: var(--shadow-md); padding: 0; background-color: var(--bg-surface);">
          
          <!-- Flag Header -->
          <div style="height: 240px; overflow: hidden; background-color: var(--bg-elevated); display: flex; align-items: center; justify-content: center; position: relative;">
            <img [src]="activeVote()!.flagUrl" [alt]="activeVote()!.teamName" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; bottom: 16px; right: 16px; background-color: var(--bg-base); color: var(--text-primary); padding: 6px 12px; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.9rem; border: 1px solid var(--bg-elevated);">
              {{ activeVote()!.countryCode }}
            </span>
          </div>

          <!-- Content Details -->
          <div style="padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 600;">Recorded Entity</span>
              <h3 style="font-family: 'Outfit'; font-size: 2.5rem; font-weight: 900; margin: 8px 0 0 0; line-height: 1; color: var(--text-primary);">{{ activeVote()!.teamName }}</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; padding: 20px; background-color: var(--bg-base); border-radius: var(--radius-md); font-size: 0.95rem; border: 1px solid var(--bg-elevated);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Record ID</span>
                <span style="font-weight: 600;">#{{ activeVote()!.id }}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Submitted At</span>
                <span style="font-weight: 600;">{{ activeVote()!.votedAt | date:'medium' }}</span>
              </div>
              <div *ngIf="activeVote()!.updatedAt" style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-muted);">Last Updated</span>
                <span style="font-weight: 600;">{{ activeVote()!.updatedAt | date:'medium' }}</span>
              </div>
            </div>

            <!-- Lock Message -->
            <div *ngIf="settings()?.isResultPublished" style="margin-bottom: 24px; padding: 16px; border-radius: var(--radius-md); font-size: 0.9rem; text-align: center; background-color: rgba(16,185,129,0.1); color: var(--color-success); font-weight: 600;">
              <mat-icon style="vertical-align: middle; margin-right: 4px; font-size: 18px; width: 18px; height: 18px;">lock</mat-icon> Submissions are finalized.
            </div>

            <!-- Suspended Message -->
            <div *ngIf="!settings()?.isResultPublished && !settings()?.isVotingEnabled" style="margin-bottom: 24px; padding: 16px; border-radius: var(--radius-md); font-size: 0.9rem; text-align: center; background-color: rgba(245,158,11,0.1); color: var(--color-warning); font-weight: 600;">
              <mat-icon style="vertical-align: middle; margin-right: 4px; font-size: 18px; width: 18px; height: 18px;">schedule</mat-icon> Modifications are currently suspended.
            </div>

            <!-- Management Buttons -->
            <div *ngIf="settings()?.isVotingEnabled && !settings()?.isResultPublished" style="display: flex; gap: 16px; width: 100%;">
              <a class="btn-flat btn-flat-primary" style="flex: 1; text-align: center;" routerLink="/teams">
                Change Selection
              </a>
              <button class="btn-flat" style="flex: 1; background-color: var(--bg-base); color: var(--color-danger); border: 1px solid var(--color-danger);" (click)="onRevoke()">
                Revoke Record
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Empty State -->
        <ng-template #emptyState>
          <mat-card style="border-radius: var(--radius-lg); padding: 64px 24px; text-align: center; border: 1px solid var(--bg-elevated); background-color: var(--bg-surface);">
            <mat-icon style="font-size: 64px; width: 64px; height: 64px; color: var(--text-muted); margin-bottom: 24px;">assignment_late</mat-icon>
            <h3 style="font-size: 1.8rem; font-weight: 800; margin: 0 0 12px 0;">No Active Record Found</h3>
            <p style="color: var(--text-muted); max-width: 350px; margin: 0 auto 32px auto; line-height: 1.6;">You have not cast an active selection in the global polls.</p>
            
            <a *ngIf="settings()?.isVotingEnabled" class="btn-flat btn-flat-primary" routerLink="/teams">
              View Options
            </a>
            <div *ngIf="!settings()?.isVotingEnabled" style="padding: 12px 20px; border-radius: var(--radius-md); background-color: var(--bg-elevated); font-size: 0.9rem; display: inline-block; font-weight: 600;">
              Window is closed.
            </div>
          </mat-card>
        </ng-template>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .btn-flat {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 8px; padding: 12px 24px; border-radius: var(--radius-md);
      font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem;
      cursor: pointer; border: none; transition: all 0.2s ease; text-decoration: none;
    }
    .btn-flat-primary {
      background-color: var(--brand-primary); color: #fff; box-shadow: var(--shadow-sm);
      &:hover { background-color: var(--brand-hover); box-shadow: var(--shadow-md); transform: translateY(-1px); }
    }
  `]
})
export class MyVoteComponent implements OnInit {
  private voteService = inject(VoteService);
  private settingService = inject(SettingService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  activeVote = signal<Vote | null>(null);
  settings = signal<Setting | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.settingService.getSettings().subscribe({
      next: (settingRes) => {
        if (settingRes.success && settingRes.data) {
          this.settings.set(settingRes.data);
        }

        this.voteService.getMyVote().subscribe({
          next: (voteRes) => {
            this.isLoading.set(false);
            if (voteRes.success && voteRes.data) {
              this.activeVote.set(voteRes.data);
            } else {
              this.activeVote.set(null);
            }
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Error fetching configurations.', 'Close', { duration: 4000 });
      }
    });
  }

  onRevoke(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Revoke Record',
        message: 'Are you sure you want to remove your selection? This action clears your data from the active tally.',
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
