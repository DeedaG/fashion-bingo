import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private baseUrl = environment.apiUrl +  '/leaderboard';

  constructor(private http: HttpClient) { }

  getLeaderboard(): Observable<Player[]> {
    return this.http.get<Player[]>(this.baseUrl);
  }

  isFullyDressed(playerId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${playerId}/check`);
  }
}
