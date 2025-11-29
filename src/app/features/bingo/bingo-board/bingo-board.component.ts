import { Component, OnInit } from '@angular/core';
import { BingoService } from '../../../core/services/bingo.service';
import { ClothingItem } from '../../../core/models/clothing-item.model';

@Component({
  selector: 'app-bingo-board',
  templateUrl: './bingo-board.component.html',
  styleUrls: ['./bingo-board.component.scss']
})
export class BingoBoardComponent implements OnInit {
  card: number[][] = [];
  reward: ClothingItem | null = null;
  playerId = 'some-player-id'; // replace with real player id logic

  constructor(private bingoService: BingoService) { }

  ngOnInit(): void {
    this.loadCard();
  }

  loadCard(): void {
    this.bingoService.getNewCard().subscribe(card => this.card = card);
  }

  onWin(): void {
    this.bingoService.claimReward(this.playerId).subscribe(reward => {
      this.reward = reward;
      alert(`You won: ${reward.name}`);
      // TODO: Add reward to closet service
    });
  }
}
