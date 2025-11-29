import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MysteryBoxReward } from '../models/mystery-box-reward.model';

@Injectable({
  providedIn: 'root'
})
export class MysterBoxService {
  private baseUrl = 'https://localhost:5001/api/leaderboard';

  constructor(private http: HttpClient) { }

  openBox(playerId: string): Observable<MysteryBoxReward> {
    return this.http.post<MysteryBoxReward>(
        `${this.baseUrl}/${playerId}/open`, {}
    );
    }
}





