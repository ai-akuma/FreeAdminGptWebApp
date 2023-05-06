import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";

import { FormGroup } from "@angular/forms";
import { YoutubeService } from "../../../service/youtube.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
    selector: 'extract-details',
    templateUrl: './extractdetails.component.html',
    styleUrls: ['./extractdetails.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class ExtractDetailsComponent implements OnInit, AfterContentInit {

    transcriptIsLoading = true;
    showErrorState = false;
    errorText = '';

    transcriptSections: string[] = [];

    scriptFormGroup: FormGroup;
    dropdownIsOpen = false;

    constructor(
        private youtubeService: YoutubeService,
        private changeDetectorRef: ChangeDetectorRef
    ) { /** */ }
    
    ngOnInit(): void {
        this.setupObservers();
        this.setupFormControls();
    }

    ngAfterContentInit(): void {
        this.youtubeService.getVideoTranscript();
        this.changeDetectorRef.detectChanges();
    }

    private setupObservers() {
        this.youtubeService.getErrorObserver().subscribe({
            next: (error: any) => {
                this.showErrorState = true;
                this.errorText = error;
                this.transcriptIsLoading = false;
                this.changeDetectorRef.detectChanges();
            }
        });
        this.youtubeService.getVideoTranscriptObserver().subscribe({
            next: (sections) => {
                console.log("🚀 ~ file: extractdetails.component.ts:47 ~ ExtractDetailsComponent ~ this.youtubeService.getVideoTranscriptObserver ~ sections:", sections)
                this.transcriptSections = sections;
                this.transcriptIsLoading = false;
                this.changeDetectorRef.detectChanges();
            },
            error: (error) => {
                this.showErrorState = true;
                this.errorText = error;
                this.transcriptIsLoading = false;
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private setupFormControls() {
        this.scriptFormGroup = new FormGroup({});
    }

    onImproveClick(prompt: string, section: string) {
        // this.youtubeService.openVideoInYoutubeStudio();
    }

    onDrop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.transcriptSections, event.previousIndex, event.currentIndex);
    }

    onScriptSubmit() {

    }
}