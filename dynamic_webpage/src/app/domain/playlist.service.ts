// playlist.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private backendUrl = 'http://localhost:5000'; // Replace with your backend URL

  constructor(private http: HttpClient) { }

  getPlaylistDetails(name: string): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/playlist/${name}`);
  }
}
