import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClothingItem } from '../models/clothing-item.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BingoService {
  private baseUrl = `${environment.apiUrl}/bingo`;

  constructor(private http: HttpClient) { }

  getNewCard(): Observable<number[][]> {
    return this.http.get<number[][]>(`${this.baseUrl}/newcard`);
  }

  claimReward(playerId: string): Observable<ClothingItem> {
    // Fix: send playerId as JSON object, not as a raw string
    return this.http.post<ClothingItem>(`${this.baseUrl}/claimreward`, { playerId });
  }

  getNextNumber(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/next-number`);
  }

  revealNextNumbers(): Observable<number[]> {
  return this.http.get<number[]>(`${this.baseUrl}/reveal-next`);
}

}
