import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, Subject } from 'rxjs';
import { GptGeneratedVideo } from '../model/gpt/gptgeneratedvideo.model';
import { GptVideoReqBody } from '../model/gpt/gptvideoreqbody.model';
import { GptResponse } from '../model/gpt/gptresponse.model';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GptService {
  
  //these need to come from our server
  private videoStyleAndToneOptions: String[] = [
    'ASMR (Autonomous Sensory Meridian Response)',
    'Gaming tutorials and playthroughs',
    'Cooking and Food',
    'DIY and crafting tutorials',
    'Educational',
    'Product reviews and unboxing videos',
    'Health and fitness tutorials and tips',
    'Beauty and fashion tutorials',
    'Financial advice and money management tutorials',
    'Motivational and self-help videos',
  ];
  private generatedVideo: GptGeneratedVideo = {
    id: '3u42o3ih23on',
    title: 'Sample title',
    description: 'here is another sample description',
    script: 'here is the very long way to say hello',
    tags: ['title', 'description', 'script'],
  };

  private sourcesVideo: GptVideoReqBody;

  private topicObserverSubject = new Subject<String>();
  private completeResultsObserverSubject = new Subject<GptGeneratedVideo>();

  constructor(private http: HttpClient) {}

  getTopicSubjectObserver() {
    return this.topicObserverSubject.asObservable();
  }

  getVideoOptionsObserver(): Observable<String[]> {
    return of(this.videoStyleAndToneOptions);
  }

  getCompleteResultsSubjectObserver(): Observable<GptGeneratedVideo> {
    return this.completeResultsObserverSubject.asObservable();
  }

  getTopicObservable(): Observable<{ message: string, result: any }> {
    return this.http.get<{ message: string, result: any }>('http://localhost:3000/api/openai/topic');
  }

  getIsolatedTopic() {
    this.getTopicObservable().subscribe((response) => {
      if (response.message !== 'success') {
        this.topicObserverSubject.next("How to make money with faceless youtube automation");
      }
      this.topicObserverSubject.next(response.result.topic);
    });
  }

  submitInputs(promptQuery: string, videoStyle: string, videoDuration: string) {
    this.sourcesVideo = {
      prompt: promptQuery,
      videoStyle: videoStyle,
      videoDuration: videoDuration,
    };
  }

  generateVideoFromSources() {
    if (this.sourcesVideo === undefined) {
      return throwError('Sources video is undefined');
    }

    const requestBody = {
      prompt: this.sourcesVideo.prompt,
      style: this.sourcesVideo.videoStyle,
      duration: this.sourcesVideo.videoDuration,
    };

    return this.http
      .post<GptResponse>('http://localhost:3000/api/openai', requestBody)
      .pipe(
        catchError((error) => {
          console.error('Failed to generate video', error);
          return throwError('Failed to generate video');
        }),
        map((gptResponse) => {
          return {
            id: gptResponse.result.id,
            title: gptResponse.result.title,
            description: gptResponse.result.description,
            script: gptResponse.result.script,
            tags: gptResponse.result.tags,
          };
        })
      )
      .subscribe((response) => {
        this.generatedVideo = response;
        this.completeResultsObserverSubject.next(response);
      });
  }

  getGptContent() {
    return this.generateVideoFromSources();
  }

  getScriptForDownload(): Observable<{ blob: Blob; filename: string }> {
    if (!this.generatedVideo || !this.generatedVideo.script) {
      return throwError('Script not available');
    }
    const blob = new Blob([this.generatedVideo.script], { type: 'text/plain' });
    return of({
      blob: blob,
      filename:
        this.generatedVideo.title
          .replace(' ', '_')
          .replace(':', '')
          .replace("'", '')
          .replace('"', '') + '.txt',
    });
  }
}
