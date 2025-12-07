import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HallOfFameService } from '../../../core/services/hall-of-fame.service';
import { HallOfFameEntry } from '../../../core/models/hall-of-fame-entry.model';

@Component({
  selector: 'app-hall-of-fame-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hall-of-fame-board.component.html',
  styleUrls: ['./hall-of-fame-board.component.css']
})
export class HallOfFameBoardComponent implements OnInit {
  entries: HallOfFameEntry[] = [];
  loading = false;
  error = '';

  constructor(private hallOfFameService: HallOfFameService) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.loading = true;
    this.hallOfFameService.getEntries().subscribe({
      next: entries => {
        this.entries = entries;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load Hall of Fame right now.';
        this.loading = false;
      }
    });
  }
}
