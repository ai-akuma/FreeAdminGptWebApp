import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Media } from '../../model/media/media.model';
import { ListVideo } from '../../model/media/video/listvideo.model';
import {
  defaultVideoStyles,
  VideoStyle,
} from '../../model/create/videostyle.model';
import {
  defaultVideoDurations,
  VideoDuration,
} from '../../model/create/videoduration.model';
import { Observable, of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  mediaSubjectObserver = new Subject<Media>();

  exampleVideos: ListVideo[] = [];

  private youtubeVideoStyles = defaultVideoStyles;
  private youtubeVideoDurations = defaultVideoDurations;

  mediaholder: Media = {
    id: '',
    audio: {
      title: '',
      file: '',
    },
    video: {
      title: '',
      file: '',
    },
    image: {
      title: '',
      file: '',
    },
  };

  private currentTopic: string;
  private currentStyle: VideoStyle;
  private currentDuration: VideoDuration = {
    name: 'please wait',
    header: '',
    description: '',
    sections: [
      {
        name: 'please wait',
        controlName: 'introduction',
        isLoading: false,
        isOptimizing: false,
        points: [],
      },
    ],
  };
  private currentMonetization: string;
  private currentProductName: string;
  private currentProductDescription: string;
  private currentLinks: string[];

  private scriptTotalNumberOfPoints: number = 0;
  private scriptMap: Map<string, string> = new Map<string, string>([
    //controlName -> script section
    ['introduction', ''],
    ['mainContent', ''],
    ['caseStudies', ''],
    ['opinions', ''],
    ['questions', ''],
    ['actionables', ''],
    ['conclusion', ''],
  ]);

  constructor(private http: HttpClient) {}

  // getVideos(): Observable<ListVideo[]> {
  //   return this.firebaseService.getVideos().subscribe((data: ListVideo[]) => {
  //     this.exampleVideos = data;
  //   }).then(() => {
  //     return of(this.exampleVideos);
  //   }
  // }

  updateScriptMap(controlName: string, script: string) {
    console.log("🚀 ~ file: content.service.ts:86 ~ ContentService ~ updateScriptMap ~ controlName:", controlName)
    console.log("🚀 ~ file: content.service.ts:86 ~ ContentService ~ updateScriptMap ~ script:", script)
    this.scriptMap.set(controlName, script);
  }

  getCompleteScript(): string {
    let script = '';
    // get all the values of the ordered hashmap in the same order
    let valuesInOrder = Array.from(this.scriptMap.keys()).map(key => this.scriptMap.get(key));
    // add all values to main string
    valuesInOrder.map(value => {
      if (value !== undefined && value !== null && value !== '') {
        script += value + '\n\n';
      }
    });
    return script;
  }

  getTotalNumberOfPoints(): number {
    return this.scriptTotalNumberOfPoints;
  }

  getVideoOptionsObserver(): Observable<VideoStyle[]> {
    return of(this.youtubeVideoStyles);
  }

  getDurationOptionsObserver(): Observable<VideoDuration[]> {
    return of(this.youtubeVideoDurations);
  }

  getMediaObserver(): Observable<Media> {
    return this.mediaSubjectObserver.asObservable();
  }

  getCurrentVideoDuration(): VideoDuration {
    return this.currentDuration;
  }

  getCurrentVideoStyle(): VideoStyle {
    return this.currentStyle;
  }

  getCurrentTopic(): string {
    return this.currentTopic;
  }

  getCurrentMonetization(): string {
    return this.currentMonetization;
  }

  getCurrentProductName(): string {
    return this.currentProductName;
  }

  getCurrentProductDescription(): string {
    return this.currentProductDescription;
  }

  getCurrentLinks(): string[] {
    return this.currentLinks;
  }

  submitInputs(
    topic: string,
    videoStyle: VideoStyle,
    videoDuration: VideoDuration,
    monetization: string,
    productName: string,
    productDescription: string,
    links: string[]
  ) {
    (this.currentTopic = topic),
      (this.currentStyle = videoStyle),
      (this.currentDuration = videoDuration),
      (this.currentMonetization = monetization),
      (this.currentProductName = productName),
      (this.currentProductDescription = productDescription),
      (this.currentLinks = links);

    this.currentDuration.sections.forEach((section) => {
      section.points.forEach((point) => {
        this.scriptTotalNumberOfPoints++;
      });
    });
  }

  updateAudioFile(audio: File) {
    this.mediaholder.audio.file = URL.createObjectURL(audio);
    this.mediaholder.audio.title = audio.name;
  }

  updateVideoFile(video: File) {
    if (
      !video.type.match(/video\/*/) ||
      !['mp4', 'webm', 'mov'].includes(video.type.split('/')[1])
    ) {
      console.log(
        '🚀 ~ file: media.service.ts:143 ~ ContentService ~ updateVideoFile ~ video.type:',
        video.type
      );
      console.error('Invalid video format.');
      return;
    }
    const videoBlob = new Blob([video], { type: video.type });
    this.mediaholder.video.file = URL.createObjectURL(videoBlob);
    this.mediaholder.video.title = video.name;
  }

  updateImageFile(image: File) {
    this.mediaholder.image.file = URL.createObjectURL(image);
    this.mediaholder.image.title = image.name;
  }

  getScriptForDownload(): Observable<{ blob: Blob; filename: string }> {
    const completeScript = this.getCompleteScript();
    if (completeScript !== '') {
      new Error(`Script not available ${completeScript}`)
    }
    const blob = new Blob([completeScript], { type: 'text/plain' });
    return of({
      blob: blob,
      filename:
        this.getCurrentTopic()
          .replace(' ', '_')
          .replace(':', '')
          .replace("'", '')
          .replace('"', '') + '.txt',
    });
  }
}
