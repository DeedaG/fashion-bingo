import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-mystery-box',
  templateUrl: './mystery-box.component.html',
  styleUrls: ['./mystery-box.component.css']
})
export class MysteryBoxComponent implements OnInit {
  leaderboard: Player[] = [];
    mysteryBoxService: any;
    reward: any;
    isOpening: boolean = false;
    playerId: string = '';
    

  constructor() {}
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    openBox() {
  this.isOpening = true;

  this.mysteryBoxService.openBox(this.playerId).subscribe((reward: any) => {
    this.reward = reward;
    this.isOpening = false;
  });
}

  
}
