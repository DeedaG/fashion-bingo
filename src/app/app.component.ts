import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BingoBoardComponent } from './features/bingo/bingo-board/bingo-board.component';
import { ClosetComponent } from './features/closet/closet.component';
import { LookbookComponent } from './features/lookbook/lookbook.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    BingoBoardComponent,
    ClosetComponent,
    LookbookComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'fashion-bingo';
  playerId = ''; // current player id shared between components
  activePanel: 'info' | 'play' | 'closet' = 'play';

  private readonly storageKey = 'fashionBingoPlayerId';

  ngOnInit(): void {
    try {
      const stored = window.localStorage?.getItem(this.storageKey);
      if (stored && stored.trim().length > 0) {
        this.playerId = stored.trim();
      }
    } catch {
      // ignore storage errors
    }
  }

  setPanel(panel: 'info' | 'play' | 'closet'): void {
    this.activePanel = panel;
  }

  handlePlayerStarted(id: string): void {
    this.playerId = id;
    try {
      window.localStorage?.setItem(this.storageKey, id);
    } catch {
      // ignore storage errors
    }
    if (this.activePanel !== 'play') {
      this.activePanel = 'play';
    }
  }
}
