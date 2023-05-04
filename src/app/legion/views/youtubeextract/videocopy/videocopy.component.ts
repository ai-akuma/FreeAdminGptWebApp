import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ContentRepository } from '../../../model/content.repo';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { YoutubeService } from 'src/app/legion/service/youtube.service';
import { YoutubeVideo } from 'src/app/legion/model/video/youtubevideo.model';
import { VideoNiche } from 'src/app/legion/model/videoniche.model';

@Component({
    selector: 'video-copy',
    templateUrl: './videocopy.component.html',
    styleUrls: ['./videocopy.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class VideoCopyComponent implements OnInit, AfterContentInit {

    isLoading = false;
    showErrorState = false;
    nicheFormGroup: FormGroup;

    videoNiches: VideoNiche[] = [];
    searchVideos: YoutubeVideo[] = [];
    selectedVideoNiche: VideoNiche = {
        name: '',
        header: '',
        description: '',
    }
    
    constructor(
        private contentRepo: ContentRepository,
        private youtubeService: YoutubeService,
        private _formBuilder: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.setupObservers();
        this.setupFormGroups();
    }

    ngAfterContentInit(): void {
        this.changeDetectorRef.detectChanges();
    }

    private setupObservers() {
        this.contentRepo.getDefaultVideoNicheObserver().subscribe({
            next: (videoNiches: VideoNiche[]) => this.videoNiches = videoNiches
        });
        this.youtubeService.getErrorObserver().subscribe({
            next: (error: any) => {
                this.isLoading = false;
                this.showErrorState = true;
            }
        });
        this.youtubeService.getYoutubeVideosObserver().subscribe({
            next: (videos: YoutubeVideo[]) => {
                console.log(videos);
                this.isLoading = false;
                this.searchVideos = videos;
            },
            complete: () => {
                this.isLoading = false;
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private setupFormGroups() {
        this.nicheFormGroup = this._formBuilder.group({
            selectedNiche: ['', Validators.required]
        });
    }

    onVideoOptionSelected(niche: VideoNiche) {
        this.selectedVideoNiche = niche;
        this.isLoading = true;
        this.youtubeService.searchYoutubeVideos(niche.name);
    }

    onCopyCatClick(video: YoutubeVideo) {
        console.log("🚀 ~ file: videocopy.component.ts:83 ~ VideoCopyComponent ~ onCopyCatClicked ~ video:", video)
        // this.isLoading = true;
        // this.youtubeService.copyYoutubeVideo(video);
    }
}