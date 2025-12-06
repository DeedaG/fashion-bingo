import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClothingItem } from '../models/clothing-item.model';
import { Economy } from '../models/economy.model';

export interface ShopOffer {
  id: string;
  name: string;
  type: string;
  style: string;
  rarity: string;
  sprite: string;
  description: string;
  costCoins: number;
}

export interface ShopPurchaseResult {
  economy: Economy;
  item: ClothingItem;
}

@Injectable({ providedIn: 'root' })
export class ShopService {
  private baseUrl = `${environment.apiUrl}/shop`;

  constructor(private http: HttpClient) {}

  getOffers(): Observable<ShopOffer[]> {
    return this.http.get<ShopOffer[]>(`${this.baseUrl}/offers`);
  }

  buyOffer(playerId: string, offerId: string): Observable<ShopPurchaseResult> {
    return this.http.post<ShopPurchaseResult>(`${this.baseUrl}/${encodeURIComponent(playerId)}/buy-item`, { offerId });
  }
}
