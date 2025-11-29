import { Component, OnInit } from '@angular/core';
import { BingoService } from '../../core/services/bingo.service';
import { ClosetService } from '../../core/services/closet.service';
import { ClothingItem } from '../../core/models/clothing-item.model';
@Component({
  selector: 'app-bingo-board',
  templateUrl: './bingo-board.component.html',
  styleUrls: ['./bingo-board.component.scss']
})
export class BingoBoardComponent implements OnInit {
  card: number[][] = [];
  reward: ClothingItem | null = null;
  playerId = 'some-player-id';

  constructor(private bingoService: BingoService, private closetService: ClosetService) {}

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

      // Add reward to closet automatically
      this.closetService.addItem(this.playerId, reward).subscribe(() => {
        console.log(`${reward.name} added to closet`);
      });
    });
  }
}
