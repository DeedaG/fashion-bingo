import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MysteryBoxReward } from '../models/mystery-box-reward.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MysterBoxService {
  private baseUrl = environment.apiUrl +  '/mysterybox';

  constructor(private http: HttpClient) { }

  openBox(playerId: string): Observable<MysteryBoxReward> {
    return this.http.post<MysteryBoxReward>(
        `${this.baseUrl}/${playerId}/open`, {}
    );
    }
}





