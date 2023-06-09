import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ContentRepository } from '../../../repository/content/content.repo';
import { VoiceService } from '../../../service/voice.service';
import { AudioDropdownComponent } from './audiodropdown/audiodropdown.component';
import { NavigationService } from '../../../service/navigation.service';
import { TranslateService } from '@ngx-translate/core';
import { Script } from 'vm';

const TEXTX_TO_VOICE_MAX = 5400;
@Component({
  selector: 'video-media',
  templateUrl: './videomedia.component.html',
  styleUrls: ['./videomedia.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class VideoMediaComponent implements OnInit, AfterContentInit, OnChanges {

  @ViewChild('audioPlayer', {static: false}) audioPlayer: ElementRef;
  private audioDropdown: AudioDropdownComponent;

  @ViewChild('audiochild', { static: false }) set content(
    content: AudioDropdownComponent
  ) {
    if (content) {
      this.audioDropdown = content;
    }
  }
  @Input() parentVideoId: string;
  
  generatedAudioIsLoading = false;
  generatedAudioUrl: string = '';
  generateAudioHidden = false;

  voiceOptions: { name: string; sampleUrl: string }[] = [];
  selectedVoice: { name: string; sampleUrl: string };
  mediaOptions = ['Video', 'Thumbnail'];
  selectedMediaOption = 'Video';

  constructor(
    protected contentRepo: ContentRepository,
    protected voiceService: VoiceService,
    protected navigationService: NavigationService,
    protected translate: TranslateService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.contentRepo.getCompleteScript().subscribe((response) => {
      this.checkScriptLength(response);
    });
    this.voiceService.getErrorObserver().subscribe((response) => {
      this.generatedAudioIsLoading = false;
      alert(response);
    });
    this.voiceService.getVoiceSamplesObserver().subscribe((response) => {
      this.audioDropdown.populateList(response);
      this.changeDetectorRef.detectChanges();
    });
    this.translate.onLangChange.subscribe(() => {
      this.voiceService.getVoices();
    });
    this.contentRepo.getGeneratedAudioUrlObserver().subscribe((response) => {
      this.generatedAudioUrl = response;
      this.changeDetectorRef.detectChanges();
    });
  }

  ngAfterContentInit() {
    this.voiceService.getVoices();
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    if (changes['parentVideoId']) {
      // Perform any additional logic or update the view as needed
      this.parentVideoId = changes['parentVideoId'].currentValue;
      if (this.parentVideoId !== undefined && this.parentVideoId !== null) {
        this.contentRepo.getGeneratedAudioUrl(this.parentVideoId)
      }
    }
  }

  onVoiceSelected(voice: { name: string, sampleUrl: string }) {
    this.selectedVoice = voice;
  }

  generateTextToSpeech() {
    if (this.selectedVoice === null || this.selectedVoice === undefined) {
      alert('Please select a voice before generating audio');
      return;
    }

    this.generatedAudioIsLoading = false;
    this.generatedAudioIsLoading = true;

    this.contentRepo.getCompleteScript().subscribe((response) => {
      const script = this.checkScriptLength(response);
      if (script !== '') {
        this.voiceService.generateTextToSpeech(
          this.selectedVoice.name,
          script
        ).subscribe({
          next: (response) => {
            console.log(response)
            this.generatedAudioIsLoading = false;
            this.generatedAudioUrl = URL.createObjectURL(response);
    
            this.audioPlayer.nativeElement.load();
            this.audioPlayer.nativeElement.play();
          },
          error: (error) => {
            console.log('🔥 error', error)
            this.generatedAudioIsLoading = false;
            alert(error);
          },
          complete: () => {
            console.log('complete')
            this.generatedAudioIsLoading = false;
          }
        });
      }
    });
  }

  descriptButtonClicked() {
    ///https://media.play.ht/full_-NTbzfZeyW_-qJQLq4Wg.mp3?generation=1682150707643372&alt=media
    window.open('https://web.descript.com/', '_blank');
  }

  onMediaOptionSelected(option: string) {
    this.selectedMediaOption = option;
  }

  private checkScriptLength(scriptValue: string): string {
    if (scriptValue === null || scriptValue === '') {
      this.generateAudioHidden = true;
    } else if (scriptValue.length >= TEXTX_TO_VOICE_MAX) {
      this.generateAudioHidden = true;
    } else {
      return scriptValue;
    }
    return  '';
  }
}
