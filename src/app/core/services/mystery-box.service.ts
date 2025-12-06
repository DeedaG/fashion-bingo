import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MysteryBoxHistoryResponse, MysteryBoxOpenResult, MysteryBoxPricing } from '../models/mystery-box-reward.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MysteryBoxService {
  private baseUrl = `${environment.apiUrl}/mysterybox`;

  constructor(private http: HttpClient) { }

  getPricing(): Observable<MysteryBoxPricing> {
    return this.http.get<MysteryBoxPricing>(`${this.baseUrl}/pricing`);
  }

  openBox(playerId: string, paymentMethod: 'coins' | 'gems' = 'coins'): Observable<MysteryBoxOpenResult> {
    return this.http.post<MysteryBoxOpenResult>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}/open`,
      { paymentMethod }
    );
  }

  getHistory(playerId: string): Observable<MysteryBoxHistoryResponse> {
    return this.http.get<MysteryBoxHistoryResponse>(
      `${this.baseUrl}/${encodeURIComponent(playerId)}/history`
    );
  }
}



