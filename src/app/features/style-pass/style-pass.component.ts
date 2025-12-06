import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StylePassService } from '../../core/services/style-pass.service';
import { StylePassState, StylePassTier } from '../../core/models/style-pass.model';

@Component({
  selector: 'app-style-pass',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './style-pass.component.html',
  styleUrls: ['./style-pass.component.css']
})
export class StylePassComponent implements OnInit, OnChanges {
  @Input() playerId = '';

  state?: StylePassState;
  loading = false;
  statusMessage = 'Complete challenges to earn style points and climb the pass.';

  readonly challengeReward = 50;

  constructor(private readonly stylePassService: StylePassService) {}

  ngOnInit(): void {
    this.tryLoad();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playerId']) {
      this.tryLoad();
    }
  }

  get progressPercent(): number {
    if (!this.state?.tiers?.length) {
      return 0;
    }
    const maxRequired = Math.max(...this.state.tiers.map(t => t.requiredPoints));
    if (maxRequired === 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.state.points / maxRequired) * 100));
  }

  completeChallenge(): void {
    if (!this.ensurePlayer()) {
      return;
    }
    this.loading = true;
    this.stylePassService.grantPoints(this.playerId.trim(), this.challengeReward).subscribe({
      next: state => {
        this.state = state;
        this.statusMessage = `+${this.challengeReward} points added!`;
        this.loading = false;
      },
      error: err => {
        this.statusMessage = this.parseError(err, 'Unable to grant challenge points.');
        this.loading = false;
      }
    });
  }

  upgradePremium(): void {
    if (!this.ensurePlayer()) {
      return;
    }
    this.loading = true;
    this.stylePassService.upgrade(this.playerId.trim()).subscribe({
      next: state => {
        this.state = state;
        this.statusMessage = 'Premium track unlocked!';
        this.loading = false;
      },
      error: err => {
        this.statusMessage = this.parseError(err, 'Unable to upgrade right now.');
        this.loading = false;
      }
    });
  }

  claimTier(tier: StylePassTier, track: 'free' | 'premium'): void {
    if (!this.ensurePlayer()) {
      return;
    }
    if (track === 'free' && (!tier.freeUnlocked || tier.freeClaimed)) {
      return;
    }
    if (track === 'premium' && (!tier.premiumUnlocked || tier.premiumClaimed)) {
      return;
    }
    this.loading = true;
    this.stylePassService.claimTier(this.playerId.trim(), tier.id, track).subscribe({
      next: state => {
        this.state = state;
        this.statusMessage = `${tier.name} ${track === 'free' ? 'free' : 'premium'} reward claimed!`;
        this.loading = false;
      },
      error: err => {
        this.statusMessage = this.parseError(err, 'Unable to claim reward.');
        this.loading = false;
      }
    });
  }

  private tryLoad(): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.state = undefined;
      return;
    }
    this.loading = true;
    this.stylePassService.getState(this.playerId.trim()).subscribe({
      next: state => {
        this.state = state;
        this.loading = false;
      },
      error: err => {
        this.statusMessage = this.parseError(err, 'Unable to load Style Pass right now.');
        this.loading = false;
      }
    });
  }

  private ensurePlayer(): boolean {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.statusMessage = 'Start a game to participate in the Style Pass.';
      return false;
    }
    return true;
  }

  private parseError(err: any, fallback: string): string {
    if (err?.error && typeof err.error === 'string') {
      return err.error;
    }
    return fallback;
  }
}
