import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClothingItem } from '../core/models/clothing-item.model';

@Injectable({
  providedIn: 'root'
})
export class BingoService {
  private baseUrl = 'https://localhost:5001/api/bingo';

  constructor(private http: HttpClient) { }

  getNewCard(): Observable<number[][]> {
    return this.http.get<number[][]>(`${this.baseUrl}/newcard`);
  }

  claimReward(playerId: string): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(`${this.baseUrl}/claimreward`, playerId);
  }
}
