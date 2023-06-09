import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HomeService } from './home.service';
import { YoutubeVideoPage } from '../../model/youtubevideopage.model';
import { YoutubeVideo } from '../../model/video/youtubevideo.model';
import { HumaneDateUtility } from '../../helper/humanedate.utility';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../common/deletedialog.component';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [HomeService],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class HomeComponent implements OnInit, AfterContentInit, OnDestroy {
  isLoading = true;
  clickAwayVideo: YoutubeVideo | undefined;

  videos: YoutubeVideoPage[] = [];
  youtubeVideos: YoutubeVideo[];

  completeListSubscription: Subscription;
  errorSubscription: Subscription;

  constructor(
    private homeService: HomeService,
    private dateUtils: HumaneDateUtility,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    /** */
  }

  ngOnInit() {
    this.clickAwayVideo = undefined;

    this.completeListSubscription = this.homeService
      .getCompleteVideoListObserver()
      .subscribe((response) => {
        this.isLoading = false;
        this.videos = response;
        this.youtubeVideos = this.videos.map((videoPage) => {
          return {
            id: videoPage.id ?? '',
            createdFrom: videoPage.createdFrom ?? '',

            title:
              videoPage.metadata?.title.replaceAll('"', '').trim() ??
              'Your Video',
            description: videoPage.metadata?.description ?? '',
            thumbnailUrl:
              videoPage.youtubeVideo?.thumbnailUrl ??
              'https://images.unsplash.com/photo-1607434472257-d9f8e57a643d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2344&q=80',
            channelTitle: videoPage.youtubeVideo?.channelTitle ?? 'you',
            publishedAt: this.dateUtils.updateDateToHumanForm(
              videoPage.createdDate
            ),
          } as YoutubeVideo;
        });
        this.changeDetectorRef.detectChanges();
      });
    this.errorSubscription = this.homeService
      .getErrorObserver()
      .subscribe((response) => {
        this.isLoading = false;
        alert(response);
      });
  }

  ngAfterContentInit() {
    this.homeService.getCompleteVideoList();
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.completeListSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }

  onItemSelectedEvent(video: YoutubeVideo) {
    if (video !== undefined) {
      this.clickAwayVideo = video;
      this.homeService.videoPageSelected(video.id, video.createdFrom ?? '');
    }
  }

  onItemDeletedEvent(video: YoutubeVideo) {
    if (video !== undefined) {
      const dialogRef = this.dialog.open(DeleteDialogComponent, {
        width: '400px',
      });

      return dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.homeService.deleteVideo(video);
        }
      });
    } else {
      return false;
    }
  }

  newCopyCat() {
    this.homeService.goToCopyCat();
  }

  newBrandNew() {
    this.homeService.goToAutoCreate();
  }
}
