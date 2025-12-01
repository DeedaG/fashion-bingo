import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BingoBoardComponent } from './features/bingo/bingo-board/bingo-board.component';
import { ClosetComponent } from './features/closet/closet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,       // ✅ for *ngIf, *ngFor
    HttpClientModule, 
    BingoBoardComponent,
    ClosetComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'fashion-bingo';
}
