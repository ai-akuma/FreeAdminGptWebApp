import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GptRepository {
  constructor(private http: HttpClient, private translate: TranslateService) {}

  postNewTopicObservable(): Observable<{ message: string; result: any }> {
    const currLang = this.translate.currentLang;
    return this.http.get<{ message: string; result: any }>(
      `${environment.apiUrl}/api/openai/topic/${currLang}`
    );
  }

  getSummaryObservable(reqBody: { prompt: string }): Observable<{
    message: string;
    result: {
      id: string;
      summary: string;
      key_points: string;
      script_voice: string;
    };
  }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{
      message: string;
      result: {
        id: string;
        summary: string;
        key_points: string;
        script_voice: string;
      };
    }>(`${environment.apiUrl}/api/openai/summary/${currLang}`, reqBody);
  }

  postNewTitleObservable(reqBody: {
    summary: string;
    style: string;
  }): Observable<{ message: string; result: { title: string } }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{ message: string; result: { title: string } }>(
      `${environment.apiUrl}/api/openai/new/title/${currLang}`,
      reqBody
    );
  }

  postOptimizedTitleObservable(reqBody: {
    prompt: string;
    current: string;
  }): Observable<{ message: string; result: { title: string } }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{ message: string; result: { title: string } }>(
      `${environment.apiUrl}/api/openai/improve/title/${currLang}`,
      reqBody
    );
  }

  postNewDescriptionObservable(reqBody: {
    summary: string;
    style: string;
  }): Observable<{ message: string; result: { description: string } }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{ message: string; result: { description: string } }>(
      `${environment.apiUrl}/api/openai/new/description/${currLang}`,
      reqBody
    );
  }

  postOptimizedDescriptionObservable(reqBody: {
    prompt: string;
    current: string;
  }): Observable<{ message: string; result: { description: string } }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{ message: string; result: { description: string } }>(
      `${environment.apiUrl}/api/openai/improve/description/${currLang}`,
      reqBody
    );
  }

  postNewScriptSectionObservable(reqBody: {
    title: string;
    voice: string;
    point: string;
    key: string;
  }): Observable<{ message: string; result: { script: string } }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{ message: string; result: { script: string } }>(
      `${environment.apiUrl}/api/openai/new/script/${currLang}`,
      reqBody
    );
  }

  postOptimizeScriptSectionObservable(
    reqBody: {
      prompt: string;
      current: string;
    },
    position: any
  ): Observable<{
    message: string;
    result: {
      script: string;
      position: any;
    };
  }> {
    const currLang = this.translate.currentLang;
    return this.http
      .post<{ message: string; result: { script: string } }>(
        `${environment.apiUrl}/api/openai/improve/script/${currLang}`,
        reqBody
      )
      .pipe(
        map((res) => {
          return {
            message: res.message,
            result: {
              script: res.result.script,
              position: position,
            },
          };
        })
      );
  }

  postNewTagsObservable(reqBody: {
    summary: string;
    style: string;
  }): Observable<{ message: string; result: { tags: string } }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{ message: string; result: { tags: string } }>(
      `${environment.apiUrl}/api/openai/new/tags/${currLang}`,
      reqBody
    );
  }

  postOptimizedTagsObservable(reqBody: {
    prompt: string;
    current: string;
  }): Observable<{ message: string; result: { tags: string } }> {
    const currLang = this.translate.currentLang;
    return this.http.post<{ message: string; result: { tags: string } }>(
      `${environment.apiUrl}/api/openai/improve/tags/${currLang}`,
      reqBody
    );
  }

  postPointsObservable(reqBody: { key_points: string; script_points: string }) {
    const currLang = this.translate.currentLang;
    return this.http.post<{
      message: string;
      result: { point_key_matching: any };
    }>(`${environment.apiUrl}/api/openai/points/${currLang}`, reqBody);
  }
}
