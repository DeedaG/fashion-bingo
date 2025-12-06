import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BoosterInventory } from '../models/booster-inventory.model';

@Injectable({ providedIn: 'root' })
export class BoosterService {
  private baseUrl = `${environment.apiUrl}/boosters`;

  constructor(private http: HttpClient) {}

  getInventory(playerId: string): Observable<BoosterInventory> {
    return this.http.get<BoosterInventory>(`${this.baseUrl}/${encodeURIComponent(playerId)}`);
  }

  purchaseBooster(playerId: string, boosterType: 'free-daub' | 'auto-daub'): Observable<BoosterInventory> {
    return this.http.post<BoosterInventory>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}/purchase`,
      { boosterType }
    );
  }

  consumeBooster(playerId: string, boosterType: 'free-daub' | 'auto-daub'): Observable<BoosterInventory> {
    return this.http.post<BoosterInventory>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}/consume`,
      { boosterType }
    );
  }
}
