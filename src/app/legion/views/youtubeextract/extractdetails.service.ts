import { TranscriptRepository } from '../../repository/transcript.repo';
import { Injectable } from '@angular/core';
import { map, Observable, of, Subject, tap } from 'rxjs';
import { YoutubeDataRepository } from '../../repository/youtubedata.repo';
import { YoutubeVideo } from '../../model/video/youtubevideo.model';
import { NavigationService } from '../../service/navigation.service';
import { TextSplitUtility } from '../../helper/textsplit.utility';
import { ExtractionContentService } from '../../service/content/extractcontent.service';
import { ExtractContentRepository } from '../../repository/content/extractcontent.repo';
import { HumaneDateUtility } from '../../helper/humanedate.utility';

@Injectable({
  providedIn: 'root',
})
export class ExtractDetailsService {
  private errorSubject = new Subject<string>();
  private kickBackErrorSubject = new Subject<string>();
  private isTranscriptLoadingSubject = new Subject<boolean>();

  private youtubeVideosSubject = new Subject<YoutubeVideo[]>();
  private videoTranscriptSubject = new Subject<
    { isLoading: boolean; section: string }[]
  >();

  private currentCopyCatVideo: YoutubeVideo;

  constructor(
    private transcriptRepo: TranscriptRepository,
    private generationService: ExtractionContentService,
    private navigationService: NavigationService,
    private textSplitUtility: TextSplitUtility,
    private youtubeRepo: YoutubeDataRepository,
    private extractContentRepo: ExtractContentRepository,
    private dateUtils: HumaneDateUtility
  ) {}

  getErrorObserver(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  getKickBackErrorObserver(): Observable<string> {
    return this.kickBackErrorSubject.asObservable();
  }

  getTranscriptIsLoadingObserver(): Observable<boolean> {
    return this.isTranscriptLoadingSubject.asObservable();
  }

  getYoutubeVideosObserver(): Observable<YoutubeVideo[]> {
    return this.youtubeVideosSubject.asObservable();
  }

  getVideoTranscriptObserver(): Observable<
    { isLoading: boolean; section: string }[]
  > {
    return this.videoTranscriptSubject.asObservable();
  }

  getScriptSectionObserver(): Observable<{
    scriptSection: string;
    sectionIndex: number;
  }> {
    return this.generationService.getScriptSectionObserver().pipe(
      map((scriptSection) => {
        console.log(
          '🚀 ~ file: extractdetails.service.ts:54 ~ ExtractDetailsService ~ map ~ scriptSection:',
          scriptSection
        );
        return {
          scriptSection: scriptSection.scriptSection.trim(),
          sectionIndex: scriptSection.position as number,
        };
      })
    );
  }

  getTitleObserver() {
    return this.generationService.getTitleObserver().pipe(
      tap((title) => {
        this.extractContentRepo.updateTitle(title);
      })
    );
  }
  getDescriptionObserver() {
    return this.generationService.getDescriptionObserver().pipe(
      tap((description) => {
        this.extractContentRepo.updateDescription(description);
      })
    );
  }
  getTagsObserver() {
    return this.generationService.getTagsObserver().pipe(
      tap((tags) => {
        this.extractContentRepo.updateTags(tags);
      })
    );
  }

  getCurrentPage(id: string) {
    return this.extractContentRepo.getCurrentPage(id).pipe(
      tap((response) => {
        if (response !== null && response !== undefined) {
          this.currentCopyCatVideo = response.youtubeVideo!!;
        }
      })
    );
  }

  getCurrentVideoUrl(): string {
    if (
      this.currentCopyCatVideo === null ||
      this.currentCopyCatVideo === undefined
    ) {
      this.navigationService.navigateToCopyCat();
    }
    return `https://www.youtube.com/embed/${this.currentCopyCatVideo.id}`;
  }

  isCurrentVideoPresent() {
    return (
      this.currentCopyCatVideo !== null &&
      this.currentCopyCatVideo !== undefined
    );
  }

  searchYoutubeVideos(niche: string) {
    this.youtubeRepo
      .getVideoListByNiche(niche)
      .pipe(
        map((videos) => {
          const newVideosList: YoutubeVideo[] = [];
          videos.forEach((video) => {
            const cleanedText = video.title
              .replaceAll(/&#39;/g, "'")
              .replaceAll(/&quot;/g, '"')
              .replaceAll(/&amp;/g, '&')
              .replaceAll(/&gt;/g, '>')
              .replaceAll(/&lt;/g, '<');
            newVideosList.push({
              ...video,
              title: cleanedText,
              publishedAt: this.dateUtils.updateDateToHumanForm(
                video.publishedAt
              ),
            });
          });
          return newVideosList;
        })
      )
      .subscribe({
        next: (videos) => this.youtubeVideosSubject.next(videos),
        error: (err) => {
          console.log(
            '🔥 ~ file: extractdetails.service.ts:148 ~ ExtractDetailsService ~ this.youtubeRepo.getVideoListByNiche ~ err:',
            err
          );
          this.errorSubject.next(err);
          this.youtubeVideosSubject.complete();
        },
      });
  }

  setCopyCatVideoId(video: YoutubeVideo) {
    this.extractContentRepo.setCurrentPageObject(video).subscribe({
      next: (response) => {
        this.currentCopyCatVideo = video;
        if (response !== null && response !== undefined) {
          this.navigationService.navigateToExtractDetails();
        }
      },
      error: (err) => {
        this.errorSubject.next(err);
      },
    });
  }

  setCopyCatVideoIdFromString(videoUrl: string) {
    const videoId = this.extractVideoId(videoUrl);
    this.extractContentRepo
      .setCurrentPageObjectFromUrlVideoId(videoId)
      .subscribe({
        next: (response) => {
          this.currentCopyCatVideo = response.youtubeVideo!!;
          if (response !== null && response !== undefined) {
            this.navigationService.navigateToExtractDetails();
          }
        },
        error: (err) => {
          this.errorSubject.next(err);
        },
      });
  }

  getNewVideoTranscript() {
    console.log(
      '🚀 ~ file: extractdetails.service.ts:156 ~ ExtractDetailsService ~ getNewVideoTranscript ~ getNewVideoTranscript:'
    );
    if (
      this.currentCopyCatVideo === null ||
      this.currentCopyCatVideo === undefined
    ) {
      this.errorSubject.next(
        'No videoId found. Sending placeholder for testing purposes.'
      );
      return; // uncomment for prod
    }

    // this.transcriptRepo.getTranscript('test').pipe(
    this.transcriptRepo
      .getTranscript(this.currentCopyCatVideo.id)
      .pipe()
      .subscribe({
        next: (response: {
          message: string;
          result: { translation: string };
        }) => {
          if (
            response.message !== 'success' ||
            response.result.translation === ''
          ) {
            this.errorSubject.next(response.message);
            return;
          }
          if (response.result.translation === '') {
            this.errorSubject.next('No transcript found.');
            return;
          }

          const uiPreppedResponse: { isLoading: boolean; section: string }[] =
            [];
          const splitParagraphs = this.textSplitUtility.splitIntoParagraphs(
            response.result.translation
          );
          this.extractContentRepo.updateCopyCatScript(splitParagraphs);

          splitParagraphs.forEach((paragraph) => {
            uiPreppedResponse.push({
              isLoading: false,
              section: paragraph.trim(),
            });
          });

          this.videoTranscriptSubject.next(uiPreppedResponse);
          this.isTranscriptLoadingSubject.next(false);
        },
        error: (err) => {
          if ((err = 'Error: Request failed with status code 505')) {
            this.kickBackErrorSubject.next(
              'Seems like the video you selected is not available for translation. Please select another video.'
            );
          } else {
            console.log(
              '🔥 ~ file: extractdetails.service.ts:122 ~ ExtractDetailsService ~ getVideoTranscript ~ err:',
              err
            );
            this.errorSubject.next(err);
          }
        },
      });
  }

  getVideoTranscript() {
    console.log(
      '🚀 ~ file: extractdetails.service.ts:198 ~ ExtractDetailsService ~ getVideoTranscript ~ getVideoTranscript:'
    );
    this.extractContentRepo.getCompleteScript().subscribe({
      next: (script) => {
        if (script === null || script === undefined || script.length === 0) {
          this.getNewVideoTranscript();
          return;
        } else {
          const uiPreppedResponse: { isLoading: boolean; section: string }[] =
            [];
          const splitParagraphs =
            this.textSplitUtility.splitIntoParagraphs(script);

          splitParagraphs.forEach((paragraph) => {
            uiPreppedResponse.push({
              isLoading: false,
              section: paragraph.trim(),
            });
          });

          this.videoTranscriptSubject.next(uiPreppedResponse);
          this.isTranscriptLoadingSubject.next(false);
        }
      },
      error: (err) => {
        this.errorSubject.next(err);
      },
    });
  }

  updateNewScriptIndex(prompt: string, section: string, index: number) {
    this.generationService.optimizeNewScriptIndex(prompt, section, index);
  }

  updateScript(transcriptSections: { isLoading: boolean; section: string }[]) {
    of(transcriptSections)
      .pipe(
        map((sections) => {
          const script: string[] = [];
          sections.forEach((section) => {
            script.push(section.section.trim());
          });
          return script;
        })
      )
      .subscribe((scriptArray: string[]) => {
        this.extractContentRepo.updateCopyCatScript(scriptArray);
      });
  }

  getNewVideoMetaData() {
    if (
      this.currentCopyCatVideo === null ||
      this.currentCopyCatVideo === undefined
    ) {
      this.errorSubject.next(
        'No videoId found. Sending placeholder for testing purposes.'
      );
      return;
    }
    //real code to uncomment below
    this.generationService.getNewTitle(
      this.currentCopyCatVideo.description,
      this.currentCopyCatVideo.title
    );
    this.generationService.getNewDescription(
      this.currentCopyCatVideo.title,
      this.currentCopyCatVideo.description
    );
    this.generationService.getNewTags(
      this.currentCopyCatVideo.title,
      this.currentCopyCatVideo.description
    );
  }

  getVideoMetaData() {
    this.extractContentRepo.getMetaData().subscribe({
      next: (response) => {
        this.generationService.titleSubject.next(response.title);
        this.generationService.descriptionSubject.next(response.description);
        this.generationService.tagsSubject.next(response.tags);
      },
      error: (err) => {
        this.errorSubject.next(err);
      },
    });
  }

  updateTitle(prompt: string, current: string) {
    this.generationService.optimizeTitle(prompt, current);
  }

  updateDescription(prompt: string, current: string) {
    this.generationService.optimizeDescription(prompt, current);
  }

  updateTags() {
    this.generationService.getNewTags(
      this.currentCopyCatVideo.title,
      this.currentCopyCatVideo.description
    );
  }

  submitSave(
    generatedAudioUrl: string,
    title: string,
    description: string,
    tags: string,
    script: string[]
  ) {
    this.extractContentRepo
      .submitCompleteInfos(generatedAudioUrl, title, description, tags, script)
      .subscribe({
        next: (response) => {
          this.kickBackErrorSubject.next('Save successful.');
        },
        error: (err) => {
          this.errorSubject.next(err);
        },
      });
  }

  clearCurrentVideoPage() {
    this.extractContentRepo.clearCurrentPage();
  }

  navigateHome() {
    this.navigationService.navigateToCopyCat();
  }

  extractVideoId(url: string) {
    let videoId = '';

    // Case 1: youtu.be format
    const youtuBeMatch = url.match(/youtu\.be\/([^\?]+)/i);
    if (youtuBeMatch) {
      videoId = youtuBeMatch[1];
    }

    // Case 2: youtube.com/watch?v= format
    const youtubeMatch = url.match(/youtube\.com\/watch\?v=([^\?&]+)/i);
    if (youtubeMatch) {
      videoId = youtubeMatch[1];
    }

    return videoId;
  }
}
