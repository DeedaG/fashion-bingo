import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BingoService } from '../../../core/services/bingo.service';
import { ClosetService } from '../../../core/services/closet.service';
import { ClothingItem } from '../../../core/models/clothing-item.model';

@Component({
  selector: 'app-bingo-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bingo-board.component.html',
  styleUrls: ['./bingo-board.component.css']
})
export class BingoBoardComponent implements OnInit {
  card: number[][] = [];
  reward: ClothingItem | null = null;
  playerId = '';
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

  constructor(private bingoService: BingoService, private closetService: ClosetService) {}

  ngOnInit(): void {
    this.loadCard();
    this.startCaller();
  }

  loadCard(): void {
    this.bingoService.getNewCard().subscribe(card => {
      this.card = card;
      this.markedNumbers.clear();
    });
  }

  loadCards(count: number): void {
  this.cards = [];
  this.markedNumbersPerCard = [];

  for (let i = 0; i < count; i++) {
    this.bingoService.getNewCard().subscribe(card => {
      this.cards[i] = card;
      this.markedNumbersPerCard[i] = new Set<number>();
    });
  }
}

  toggleMark(num: number, cardIndex: number): void {
    const markedNumbers = this.markedNumbersPerCard[cardIndex];

    if (this.freeDaubMode) {
      markedNumbers.add(num);
      this.freeDaubMode = false;
      return;
    }

    if (markedNumbers.has(num)) {
      markedNumbers.delete(num);
    } else {
      markedNumbers.add(num);
    }
  }

  isMarked(num: number, cardIndex: number): boolean {
    return this.markedNumbersPerCard[cardIndex].has(num);
  }

  autoMark(num: number): void {
    this.markedNumbersPerCard.forEach(set => set.add(num));
  }

   

  onWin(): void {
    this.bingoService.claimReward(this.playerId).subscribe(reward => {
      this.reward = reward;
      alert(`You won: ${reward.name}`);

      this.closetService.addItem(this.playerId, reward).subscribe(() => {
        console.log(`${reward.name} added to closet`);
      });
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

        // auto-mark on card if number exists
        this.autoMark(num);
      });
    }, 2500); // Calls a new number every 2.5 seconds
  }

  stopCaller(): void {
    clearInterval(this.callerInterval);
    this.isCalling = false;
  }

  //free daub mode
  activateFreeDaub(): void {
    this.freeDaubMode = true;
    alert("Free Daub activated! Tap any cell to daub it.");
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
      if (this.autoDaubActive) return;

      this.autoDaubActive = true;
      alert("Auto-Daub activated for 30 seconds!");

      this.autoDaubTimer = setTimeout(() => {
        this.autoDaubActive = false;
      }, 30000);
    }

}
