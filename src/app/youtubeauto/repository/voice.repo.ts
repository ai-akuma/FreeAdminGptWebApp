import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  throwError,
  Subject,
  catchError,
  of,
} from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class VoiceRepository {

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) { /** */ }

  getListOfVoices(): Observable<{ message: string, result: { name: string, id: string }[]}> {
    return this.http.get<{ message: string, result: { name: string, id: string }[]}>(
      `http://localhost:3000/api/voices`
    );
  }

  getTextToSpeechSteam(
    voiceId: string,
    scriptValue: string
  ): Observable<Blob> {
    if (voiceId === null || voiceId === undefined || voiceId === '') {
      return of(new Blob())
    }
    const currLang = this.translate.currentLang;
    const reqBody = {
      text: scriptValue,
      voice_id: voiceId,
    }
    const headers = new HttpHeaders({
      'Content-Type': 'audio/mpeg',
      'Accept': 'audio/mpeg'
    });
    const options = {
      headers: headers,
      responseType: 'blob' as const
    }
    return this.http.post(
      `http://localhost:3000/api/voices/${voiceId}/${currLang}`,
      reqBody,
      options
    );
  }
}