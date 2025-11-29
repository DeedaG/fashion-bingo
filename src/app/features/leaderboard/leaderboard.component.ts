import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { Player } from '../../core/models/player.model';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  leaderboard: Player[] = [];

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.leaderboardService.getLeaderboard().subscribe(players => {
      this.leaderboard = players;
    });
  }
}
