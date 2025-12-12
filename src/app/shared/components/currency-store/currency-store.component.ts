import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EconomyService } from '../../../core/services/economy.service';

@Component({
  selector: 'app-currency-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-store.component.html',
  styleUrls: ['./currency-store.component.css']
})
export class CurrencyStoreComponent {
  @Input() playerId = '';
  @Output() balanceChange = new EventEmitter<{ coins: number; gems: number }>();

  statusMessage = '';
  loading = false;
  coinsBalance = 0;
  gemsBalance = 0;

  constructor(private readonly economyService: EconomyService) {}

  buyCoins(amount: number): void {
    this.purchase(amount, 0);
  }

  buyGems(amount: number): void {
    this.purchase(0, amount);
  }

  private purchase(coins: number, gems: number): void {
    if (!this.playerId || this.playerId.trim().length === 0) {
      this.statusMessage = 'Start a game to top up currency.';
      return;
    }
    this.loading = true;
    this.statusMessage = 'Processing purchase...';
    this.economyService.topUp(this.playerId.trim(), coins, gems).subscribe({
      next: econ => {
        this.loading = false;
        this.statusMessage = `Balance updated: ${econ.coins} coins · ${econ.gems} gems`;
        this.coinsBalance = econ.coins;
        this.gemsBalance = econ.gems;
        this.balanceChange.emit({ coins: econ.coins, gems: econ.gems });
      },
      error: () => {
        this.loading = false;
        this.statusMessage = 'Unable to complete purchase right now.';
      }
    });
  }
}
