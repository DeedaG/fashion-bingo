import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BingoService } from '../../../core/services/bingo.service';
import { ClosetService } from '../../../core/services/closet.service';
import { PlayerService } from '../../../core/services/player.service';
import { BoosterService } from '../../../core/services/booster.service';
import { ClothingItem } from '../../../core/models/clothing-item.model';
import { BoosterInventory } from '../../../core/models/booster-inventory.model';
import { CurrencyStoreComponent } from '../../../shared/components/currency-store/currency-store.component';

@Component({
  selector: 'app-bingo-board',
  standalone: true,
  imports: [CommonModule, CurrencyStoreComponent],
  templateUrl: './bingo-board.component.html',
  styleUrls: ['./bingo-board.component.css']
})
export class BingoBoardComponent implements OnInit {
  card: number[][] = [];
  reward: ClothingItem | null = null;
  @Input() playerId = '';               // accept playerId from parent
  @Output() playerStarted = new EventEmitter<string>(); // emit when a game starts
  currentNumber: number | null = null;
  callHistory: number[] = [];
  callerInterval: any;
  isCalling = false;
  markedNumbers: Set<number> = new Set<number>();
  freeDaubMode = false;
  revealedNumbers: number[] = [];
  autoDaubActive = false;
  autoDaubTimer: any;
  cards: number[][][] = []; // Array of cards
  selectedCardIndex = 0; // optional: highlight one card
  markedNumbersPerCard: Set<number>[] = [];

  // track per-card bingo and claimed state so UI can show a "BINGO!" and enable claim button
  bingoDetected: boolean[] = [];
  claimedCards: boolean[] = [];
  // small status message for daub/claim actions so the UI can display what happened
  lastActionMessage = '';
  demoMode = true; // true = auto-mark demo, false = manual game
  private playerProfileReady = false;
  private registeringPlayer = false;
  rewardModalVisible = false;
  rewardDeliveryMessage = '';
  rewardDelivering = false;
  boosterInventory: BoosterInventory | null = null;
  boosterStatus = '';
  boosterLoading = false;
  depositModalVisible = false;

  constructor(
    private bingoService: BingoService,
    private closetService: ClosetService,
    private playerService: PlayerService,
    private boosterService: BoosterService
  ) {}

  ngOnInit(): void {
    // don't assume a playerId on init; startGame() will set/emit when user begins play
    this.loadCards(3);
    this.startCaller();
  }

  startGame(): void {
    this.demoMode = false;
    this.autoDaubActive = false;
    this.freeDaubMode = false;
    this.resetCardsForLivePlay();
    // ensure we have a playerId: prefer input, else generate a client-side id
    if (!this.playerId || this.playerId.trim().length === 0) {
      try {
        // modern browsers support crypto.randomUUID()
        this.playerId = (window.crypto && (window.crypto as any).randomUUID)
          ? (window.crypto as any).randomUUID()
          : `player-${Date.now()}`;
      } catch {
        this.playerId = `player-${Date.now()}`;
      }
    }
    this.registerOrStartPlayer();
  }

  private resetCardsForLivePlay(): void {
    const cardCount = this.cards?.length && this.cards.length > 0 ? this.cards.length : 3;
    this.loadCards(cardCount);
    this.lastActionMessage = 'New bingo cards are ready! Listen for the next number.';
  }

  private registerOrStartPlayer(): void {
    if (this.playerProfileReady) {
      this.emitPlayerStarted();
      return;
    }
    if (this.registeringPlayer) {
      return;
    }

    this.registeringPlayer = true;
    this.playerService.createPlayer(this.playerId).subscribe({
      next: () => {
        this.playerProfileReady = true;
        this.registeringPlayer = false;
        this.emitPlayerStarted();
      },
      error: err => {
        this.registeringPlayer = false;
        if (err.status === 409 || err.status === 400) {
          // Assume the profile already exists; continue with the game.
          this.playerProfileReady = true;
          this.emitPlayerStarted();
        } else {
          console.error('Failed to register player profile', err);
          this.lastActionMessage = 'Failed to register your player profile. Please try again.';
        }
      }
    });
  }

  private emitPlayerStarted(): void {
    this.lastActionMessage = 'Game started! Now you must manually mark the called number.';
    this.playerStarted.emit(this.playerId);
    this.loadBoosters();
  }

  loadCard(): void {
    this.bingoService.getNewCard().subscribe(card => {
      this.card = card;
      this.markedNumbers.clear();
    });
  }

  loadCards(count: number): void {
    this.cards = new Array(count);
    this.markedNumbersPerCard = new Array(count);
    this.bingoDetected = new Array(count).fill(false);
    this.claimedCards = new Array(count).fill(false);

    for (let i = 0; i < count; i++) {
      // placeholders to keep template safe
      this.cards[i] = [];
      this.markedNumbersPerCard[i] = new Set<number>();

      this.bingoService.getNewCard().subscribe(card => {
        this.cards[i] = card;
        this.markedNumbersPerCard[i] = new Set<number>();
        this.bingoDetected[i] = false;
        this.claimedCards[i] = false;
      });
    }
  }

  toggleMark(num: number, cardIndex: number): void {
    if (!this.markedNumbersPerCard[cardIndex]) {
      this.markedNumbersPerCard[cardIndex] = new Set<number>();
    }
    const markedNumbers = this.markedNumbersPerCard[cardIndex];

    // In game mode, only allow marking if the cell matches the current called number, or if free daub mode is active
    if (!this.demoMode && !this.freeDaubMode && num !== this.currentNumber) {
      this.lastActionMessage = `You can only mark the current called number (${this.currentNumber}) unless Free Daub is active.`;
      return;
    }

    if (this.freeDaubMode) {
      markedNumbers.add(num);
      this.freeDaubMode = false;
      this.lastActionMessage = `Free daub used on ${num} (card ${cardIndex + 1}).`;
      // check for bingo after free daub
      if (this.checkWinForCard(cardIndex)) {
        this.bingoDetected[cardIndex] = true;
        this.lastActionMessage = `BINGO detected on card ${cardIndex + 1}! Claim your reward.`;
      }
      return;
    }

    if (markedNumbers.has(num)) {
      markedNumbers.delete(num);
      this.lastActionMessage = `Unmarked ${num} (card ${cardIndex + 1}).`;
    } else {
      markedNumbers.add(num);
      this.lastActionMessage = `Marked ${num} (card ${cardIndex + 1}).`;
      // check for bingo when a number is marked
      if (this.checkWinForCard(cardIndex)) {
        this.bingoDetected[cardIndex] = true;
        this.lastActionMessage = `BINGO detected on card ${cardIndex + 1}! Claim your reward.`;
      }
    }
  }

  isMarked(num: number, cardIndex: number): boolean {
    const set = this.markedNumbersPerCard[cardIndex];
    return !!set && set.has(num);
  }

  autoMark(num: number): void {
    this.markedNumbersPerCard.forEach((set, idx) => {
      if (!set) {
        this.markedNumbersPerCard[idx] = new Set<number>();
        set = this.markedNumbersPerCard[idx];
      }
      set.add(num);
      // detect bingo per card when auto-marking
      if (this.checkWinForCard(idx)) {
        if (!this.bingoDetected[idx]) {
          this.bingoDetected[idx] = true;
          this.lastActionMessage = `BINGO detected on card ${idx + 1} by auto-mark!`;
        }
      }
    });
  }

  // legacy wrapper: claim reward for currently selected card if template calls onWin()
  onWin(): void {
    // Only claim if the selected card has bingo and is not already claimed
    if (!this.bingoDetected[this.selectedCardIndex]) {
      this.lastActionMessage = `No bingo on card ${this.selectedCardIndex + 1} to claim.`;
      return;
    }
    if (this.claimedCards[this.selectedCardIndex]) {
      this.lastActionMessage = `Card ${this.selectedCardIndex + 1} reward already claimed.`;
      return;
    }
    this.claimReward(this.selectedCardIndex);
  }

  // Claim reward for a specific card index. Only works if bingoDetected and not already claimed.
  claimReward(cardIndex: number): void {
    if (!this.bingoDetected[cardIndex]) {
      this.lastActionMessage = `No bingo on card ${cardIndex + 1} to claim.`;
      return;
    }
    if (this.claimedCards[cardIndex]) {
      this.lastActionMessage = `Card ${cardIndex + 1} reward already claimed.`;
      return;
    }

    this.bingoService.claimReward(this.playerId).subscribe(reward => {
      this.reward = reward;
      this.claimedCards[cardIndex] = true;
      this.lastActionMessage = `You won: ${reward.name} (card ${cardIndex + 1})`;
      this.rewardModalVisible = true;
      this.rewardDeliveryMessage = 'Placing your prize in the closet...';
      this.rewardDelivering = true;
      this.focusRewardModal();

      if (reward) {
        this.closetService.addItem(this.playerId, reward).subscribe(() => {
          this.lastActionMessage = `${reward.name} added to your closet!`;
          this.rewardDelivering = false;
          this.rewardDeliveryMessage = `${reward.name} is hanging in your closet now.`;
          // notify via service (real-time flow)
          try { this.closetService.notifyClosetUpdated(this.playerId); } catch { /* ignore */ }
        }, err => {
          this.lastActionMessage = `Failed to add ${reward.name} to closet.`;
          this.rewardDelivering = false;
          this.rewardDeliveryMessage = `We couldn't place ${reward.name} in your closet. Please try again.`;
        });
      }
    }, err => {
      this.lastActionMessage = `Failed to claim reward for card ${cardIndex + 1}.`;
    });
  }

  startCaller(): void {
    if (this.isCalling) return;

    this.isCalling = true;

    this.callerInterval = setInterval(() => {
      this.bingoService.getNextNumber().subscribe(num => {
        this.currentNumber = num;
        this.callHistory.unshift(num);

        // keep last 10 numbers
        if (this.callHistory.length > 10) {
          this.callHistory.pop();
        }

        if (this.demoMode) {
          // In demo mode, auto-mark all cards
          this.autoMark(num);
        }
        // In game mode, only display the called number. User must click to mark.
      });
    }, 5000); // Calls a new number every 5 seconds
  }

  stopCaller(): void {
    if (this.callerInterval) {
      clearInterval(this.callerInterval);
      this.callerInterval = null;
    }
    this.isCalling = false;
  }

  //free daub mode
  activateFreeDaub(): void {
    if (!this.ensureBoosterAvailable('free-daub')) {
      return;
    }
    this.consumeBooster('free-daub', () => {
      this.freeDaubMode = true;
      this.lastActionMessage = 'Free Daub activated — tap any cell to daub it once.';
    });
  }

  //reveal 3 numbers
  activateReveal(): void {
    this.bingoService.revealNextNumbers().subscribe(numbers => {
      this.revealedNumbers = numbers;

      setTimeout(() => this.revealedNumbers = [], 8000);
    });
  }

  //auto daub
  activateAutoDaub(): void {
    if (this.autoDaubActive) {
      return;
    }
    if (!this.ensureBoosterAvailable('auto-daub')) {
      return;
    }
    this.consumeBooster('auto-daub', () => {
      this.autoDaubActive = true;
      this.lastActionMessage = 'Auto-Daub activated for 30 seconds.';

      this.autoDaubTimer = setTimeout(() => {
        this.autoDaubActive = false;
        this.lastActionMessage = 'Auto-Daub ended.';
      }, 30000);
    });
  }

  closeRewardModal(): void {
    this.rewardModalVisible = false;
    if (!this.rewardDelivering) {
      this.reward = null;
      this.rewardDeliveryMessage = '';
    }
  }

  private focusRewardModal(): void {
    const scrollToTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        try {
          document?.documentElement?.scrollTo?.(0, 0);
        } catch {
          // ignore
        }
      }
    };

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(() => scrollToTop());
    } else {
      setTimeout(scrollToTop, 0);
    }
  }

  openDepositModal(): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.lastActionMessage = 'Start a game to deposit funds.';
      return;
    }
    this.depositModalVisible = true;
  }

  closeDepositModal(): void {
    this.depositModalVisible = false;
  }

  // returns true if the card at cardIndex has a completed row/col/diagonal
  private checkWinForCard(cardIndex: number): boolean {
    const card = this.cards[cardIndex];
    const marked = this.markedNumbersPerCard[cardIndex];
    if (!card || !marked || card.length === 0) return false;

    const size = card.length; // assume square (5)

    // check rows
    for (let r = 0; r < size; r++) {
      let rowComplete = true;
      for (let c = 0; c < size; c++) {
        const val = card[r][c];
        if (!marked.has(val)) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) return true;
    }

    // check cols
    for (let c = 0; c < size; c++) {
      let colComplete = true;
      for (let r = 0; r < size; r++) {
        const val = card[r][c];
        if (!marked.has(val)) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) return true;
    }

    // diagonal top-left -> bottom-right
    let diag1 = true;
    for (let i = 0; i < size; i++) {
      if (!marked.has(card[i][i])) {
        diag1 = false;
        break;
      }
    }
    if (diag1) return true;

    // diagonal top-right -> bottom-left
    let diag2 = true;
    for (let i = 0; i < size; i++) {
      if (!marked.has(card[i][size - 1 - i])) {
        diag2 = false;
        break;
      }
    }
    if (diag2) return true;

    return false;
  }

  purchaseBooster(type: 'free-daub' | 'auto-daub'): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.boosterStatus = 'Start a game to shop for boosters.';
      return;
    }
    this.boosterLoading = true;
    this.boosterService.purchaseBooster(this.playerId.trim(), type).subscribe({
      next: inv => {
        this.boosterInventory = inv;
        this.boosterStatus = type === 'free-daub'
          ? 'Free Daub token added to your satchel.'
          : 'Auto-Daub boost added.';
        this.boosterLoading = false;
      },
      error: err => {
        const msg = err?.error ?? 'Purchase failed.';
        this.boosterStatus = typeof msg === 'string' ? msg : 'Purchase failed.';
        this.boosterLoading = false;
      }
    });
  }

  private loadBoosters(): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      return;
    }
    this.boosterService.getInventory(this.playerId.trim()).subscribe({
      next: inv => {
        this.boosterInventory = inv;
      },
      error: () => {
        this.boosterStatus = 'Unable to load booster inventory.';
      }
    });
  }

  private ensureBoosterAvailable(type: 'free-daub' | 'auto-daub'): boolean {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.boosterStatus = 'Start a game to use boosters.';
      return false;
    }
    const inv = this.boosterInventory;
    if (!inv) {
      this.boosterStatus = 'Loading boosters…';
      return false;
    }
    const available = type === 'free-daub' ? inv.freeDaubTokens : inv.autoDaubBoosts;
    if (available <= 0) {
      this.boosterStatus = 'Purchase more boosters to use this power-up.';
      return false;
    }
    return true;
  }

  private consumeBooster(type: 'free-daub' | 'auto-daub', onSuccess: () => void): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      return;
    }
    this.boosterService.consumeBooster(this.playerId.trim(), type).subscribe({
      next: inv => {
        this.boosterInventory = inv;
        onSuccess();
      },
      error: err => {
        const msg = err?.error ?? 'Unable to use booster.';
        this.boosterStatus = typeof msg === 'string' ? msg : 'Unable to use booster.';
      }
    });
  }
}
