import { Injectable } from '@angular/core';
import { from, Observable, Subject, concatMap, filter, switchMap } from 'rxjs';
import { AutoContentRepository } from '../../repository/content/autocontent.repo';
import { GptRepository } from '../../repository/gpt.repo';
import {
  DurationSection,
  VideoDuration,
} from '../../model/autocreate/videoduration.model';
import { GenerateContentService } from './generation.service';
import { VideoMetadata } from '../../model/video/videometadata.model';
import { VideoNiche } from '../../model/autocreate/videoniche.model';

@Injectable({
  providedIn: 'root',
})
export class AutoContentService extends GenerateContentService {
  private totalScriptPoints: number = 0;

  private completeDetailsSubject = new Subject<{
    meta: VideoMetadata;
  }>();

  constructor(
    gptRepo: GptRepository,
    private contentRepo: AutoContentRepository
  ) {
    super(gptRepo);
  }

  getCompleteResultsObserver(): Observable<{
    meta: VideoMetadata;
  }> {
    return this.completeDetailsSubject.asObservable();
  }

  updateNewTopic() {
    this.gptRepo.postNewTopicObservable().subscribe((response) => {
      if (response.message !== 'success') {
        this.errorSubject.next(response.message);
        return;
      }
      this.topicSubject.next(response.result.topic);
    });
  }

  setTotalScriptPoints(duration: VideoDuration) {
    duration.sections.forEach((section) => {
      section.points.forEach((point) => {
        this.totalScriptPoints++;
      });
    });
  }

  resetTotalScriptPoints() {
    this.totalScriptPoints = 0;
  }

  generateVideoContentWithAI(
    topic: string,
    niche: VideoNiche,
    duration: VideoDuration
  ) {
    if (topic === undefined || niche === undefined || duration === undefined) {
      this.errorSubject.next(
        '🤔 Something is not right. Please go back to the beginning and try again.'
      );
      return;
    }

    let compeleteMetaData: VideoMetadata = {
      summary: '',
      title: '',
      description: '',
      tags: [],
    };

    this.gptRepo
      .getSummaryObservable({
        prompt: topic,
      })
      .subscribe((response) => {
        if (response.message !== 'success') {
          this.errorSubject.next(response.message);
          return;
        } else {
          const requestSummary = response.result.summary;
          console.log(
            '🚀 ~ file: autocontent.service.ts:97 ~ AutoContentService ~ requestSummary:',
            requestSummary
          );
          const requestKeyPoints = response.result.key_points;
          console.log(
            '🚀 ~ file: autocontent.service.ts:99 ~ AutoContentService ~ requestKeyPoints:',
            requestKeyPoints
          );
          const requestScriptVoice = response.result.script_voice;
          console.log(
            '🚀 ~ file: autocontent.service.ts:101 ~ AutoContentService ~ requestScriptVoice:',
            requestScriptVoice
          );
          compeleteMetaData.summary = requestSummary;

          this.gptRepo
            .postNewTitleObservable({
              summary: requestSummary,
              style: niche.name,
            })
            .subscribe((response) => {
              if (response.message !== 'success') {
                this.errorSubject.next(response.message);
                return;
              } else {
                compeleteMetaData.title = response.result.title;
                this.checkForCompleteResultsCompletion(
                  compeleteMetaData,
                  requestKeyPoints,
                  requestScriptVoice,
                  duration
                );
              }
            });

          this.gptRepo
            .postNewDescriptionObservable({
              summary: requestSummary,
              style: niche.name,
            })
            .subscribe((response) => {
              if (response.message !== 'success') {
                this.errorSubject.next(response.message);
                return;
              } else {
                compeleteMetaData.description = response.result.description;
                this.checkForCompleteResultsCompletion(
                  compeleteMetaData,
                  requestKeyPoints,
                  requestScriptVoice,
                  duration
                );
              }
            });

          this.gptRepo
            .postNewTagsObservable({
              summary: requestSummary,
              style: niche.name,
            })
            .subscribe((response) => {
              if (response.message !== 'success') {
                this.errorSubject.next(response.message);
                return;
              } else {
                compeleteMetaData.tags = response.result.tags.split(',');
                this.checkForCompleteResultsCompletion(
                  compeleteMetaData,
                  requestKeyPoints,
                  requestScriptVoice,
                  duration
                );
              }
            });
        }
      });
  }

  /**
   * With this function we check if the complete results are ready to be displayed meaning every field has a non-null and non-empty value
   * When we are ready to display the results we call .next() on the completeResultsObserverSubject, otherwise take no action
   * @returns
   */
  checkForCompleteResultsCompletion(
    metadata: VideoMetadata,
    key_points: string,
    script_voice: string,
    duration: VideoDuration
  ) {
    if (
      metadata.title !== '' &&
      metadata.description !== '' &&
      metadata.tags.length > 0
    ) {
      this.contentRepo.updateCompleteMetaData(metadata);

      this.gptRepo
        .postPointsObservable({
          key_points: key_points,
          script_points: this.getNestedSectionPointsAsList(duration).join(','),
        })
        .subscribe((response) => {
          if (response.message !== 'success') {
            this.errorSubject.next(response.message);
            return;
          } else {
            const matched_points = response.result.point_key_matching;
            const matchedPointsObj = JSON.parse(matched_points);
            let compiledPoints = '';
            let sectionsCount = 0;

            duration.sections.forEach((section: DurationSection) => {
              // here we are filtering the matched points to only include the points that are in the current section
              from(Object.entries(matchedPointsObj))
                .pipe(
                  filter(([sectionPoint, key_point]) => {
                    return section.points.includes(sectionPoint);
                  }),
                  switchMap(([sectionPoint, keyPoint]) => {
                    console.log(
                      `checkin in\ntitle => ${metadata.title} \nsection => ${sectionPoint}  \nkeypoint => ${keyPoint} \nvoice => ${script_voice}`
                    );
                    let keyPointStr = keyPoint as string;
                    return this.gptRepo.postNewScriptSectionObservable({
                      title: metadata.title,
                      voice: script_voice,
                      point: sectionPoint,
                      key: keyPointStr,
                    });
                  })
                )
                .subscribe(
                  (response: {
                    message: string;
                    result: { script: string };
                  }) => {
                    console.log(
                      '🚀 ~ file: autocontent.service.ts:197 ~ AutoContentService ~ ).subscribe ~ response:',
                      duration.sections.length
                    );
                    console.log(
                      '🚀 ~ file: autocontent.service.ts:198 ~ AutoContentService ~ ).subscribe ~ response:',
                      response
                    );
                    if (response.message !== 'success') {
                      this.errorSubject.next(response.message);
                      return;
                    }
                    sectionsCount++;
                    compiledPoints += '\n' + response.result.script;

                    this.contentRepo.updateScriptMap(
                      section.controlName,
                      compiledPoints.trim()
                    );
                    // emit just the view value of the section
                    this.scriptSectionSubject.next({
                      scriptSection: response.result.script.trim(),
                      position: section.controlName,
                    });

                    if (duration.sections.length === sectionsCount) {
                      this.completeDetailsSubject.next({ meta: metadata });
                    }
                  }
                );
            });
          }
        });
    }
  }

  getNestedSectionPointsAsList(duratiom: VideoDuration): string[] {
    const pointsList: string[] = [];
    duratiom.sections.forEach((section) => {
      section.points.forEach((point) => {
        pointsList.push(point);
      });
    });
    return pointsList;
  }

  getTotalScriptPoints(): number {
    return this.totalScriptPoints;
  }
}
