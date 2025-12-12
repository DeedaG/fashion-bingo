import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MysteryBoxService } from '../../core/services/mystery-box.service';
import { ClosetService } from '../../core/services/closet.service';
import { PlayerService } from '../../core/services/player.service';
import {
  CoinSourceBreakdown,
  MysteryBoxHistoryEntry,
  MysteryBoxOpenResult,
  MysteryBoxPricing
} from '../../core/models/mystery-box-reward.model';
import { Economy } from '../../core/models/economy.model';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-mystery-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mystery-box.component.html',
  styleUrls: ['./mystery-box.component.css']
})
export class MysteryBoxComponent implements OnInit, OnChanges, OnDestroy {
  @Input() playerId = '';

  isOpening = false;
  statusMessage = 'Open a glam crate to snag bonuses and surprise runway items.';
  reward: MysteryBoxOpenResult | null = null;
  rewardModalVisible = false;
  pricing?: MysteryBoxPricing;
  economy: Economy = { coins: 0, gems: 0, energy: 0 };
  historyEntries: MysteryBoxHistoryEntry[] = [];
  coinSources?: CoinSourceBreakdown;
  historyLoading = false;
  showConfetti = false;
  readonly confettiPieces = Array.from({ length: 14 }).map((_, index) => index);
  private confettiTimeout: any;

  private readonly fallbackPricing: MysteryBoxPricing = { coinCost: 300, gemCost: 1 };

  constructor(
    private readonly mysteryBoxService: MysteryBoxService,
    public readonly closetService: ClosetService,
    private readonly playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.loadPricing();
  }

  ngOnDestroy(): void {
    if (this.confettiTimeout) {
      clearTimeout(this.confettiTimeout);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playerId']) {
      const nextId = (changes['playerId'].currentValue ?? '').toString().trim();
      if (nextId.length > 0) {
        this.fetchEconomy(nextId);
        this.loadHistory(nextId);
      } else {
        this.resetState();
      }
    }
  }

  get coinCost(): number {
    return this.pricing?.coinCost ?? this.fallbackPricing.coinCost;
  }

  get gemCost(): number {
    return this.pricing?.gemCost ?? this.fallbackPricing.gemCost;
  }

  canAfford(payment: 'coins' | 'gems'): boolean {
    if (!this.playerId || this.playerId.trim().length === 0) {
      return false;
    }
    if (payment === 'gems') {
      return (this.economy?.gems ?? 0) >= this.gemCost;
    }
    return (this.economy?.coins ?? 0) >= this.coinCost;
  }

  openBox(payment: 'coins' | 'gems' = 'coins'): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.statusMessage = 'Start a game to claim a player ID before opening boxes.';
      return;
    }
    if (!this.canAfford(payment)) {
      this.statusMessage = `You need more ${payment === 'gems' ? 'gems' : 'coins'} for that crate.`;
      return;
    }

    this.isOpening = true;
    this.statusMessage = 'Unlocking your crate…';
    this.mysteryBoxService.openBox(this.playerId.trim(), payment).subscribe({
      next: result => {
        this.reward = result;
        this.rewardModalVisible = true;
        this.economy = result.economy ?? this.economy;
        this.statusMessage = `You pulled a ${result.rarity} item!`;
        this.isOpening = false;
        this.triggerConfetti();
        this.loadHistory(this.playerId.trim());
        try {
          this.closetService.notifyClosetUpdated(this.playerId.trim());
        } catch {
          // ignore
        }
      },
      error: err => {
        const message = err?.error ?? 'Unable to open the crate right now.';
        this.statusMessage = typeof message === 'string' ? message : 'Unable to open the crate right now.';
        this.isOpening = false;
      }
    });
  }

  closeRewardModal(): void {
    this.rewardModalVisible = false;
  }

  private resetState(): void {
    this.reward = null;
    this.economy = { coins: 0, gems: 0, energy: 0 };
    this.historyEntries = [];
    this.coinSources = undefined;
  }

  private loadPricing(): void {
    this.mysteryBoxService.getPricing().subscribe({
      next: pricing => (this.pricing = pricing),
      error: () => {
        this.pricing = this.fallbackPricing;
      }
    });
  }

  private fetchEconomy(playerId: string): void {
    this.playerService.getPlayer(playerId).subscribe({
      next: (player: Player) => {
        if (player?.economy) {
          this.economy = player.economy;
        } else if (typeof player?.coins === 'number') {
          this.economy = { coins: player.coins, gems: 0, energy: 0 };
        }
      },
      error: () => {
        this.statusMessage = 'Unable to load your balance. Try starting a new game.';
      }
    });
  }

  private loadHistory(playerId: string): void {
    this.historyLoading = true;
    this.mysteryBoxService.getHistory(playerId).subscribe({
      next: response => {
        this.historyEntries = response.entries ?? [];
        this.coinSources = response.coinSources;
        this.historyLoading = false;
      },
      error: () => {
        this.historyEntries = [];
        this.historyLoading = false;
      }
    });
  }

  private triggerConfetti(): void {
    this.showConfetti = true;
    if (this.confettiTimeout) {
      clearTimeout(this.confettiTimeout);
    }
    this.confettiTimeout = setTimeout(() => {
      this.showConfetti = false;
    }, 2500);
  }
}
