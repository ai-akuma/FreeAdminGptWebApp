import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { VideoMediaComponent } from "../../../common/videomedia/videomedia.component";
import { TranslateService } from "@ngx-translate/core";
import { NavigationService } from "../../../../service/navigation.service";
import { VoiceService } from "../../../../service/voice.service";
import { ExtractContentRepository } from "../../../../repository/content/extractcontent.repo";

@Component({
  selector: 'extract-media',
  templateUrl: '../../../common/videomedia/videomedia.component.html',
  styleUrls: ['../../../common/videomedia/videomedia.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ExtractMediaComponent extends VideoMediaComponent {

  constructor(
    contentRepo: ExtractContentRepository, 
    voiceService: VoiceService,
    navigationService: NavigationService,
    translate: TranslateService,
    changeDetectorRef: ChangeDetectorRef
  ) {
    super(
      contentRepo,
      voiceService,
      navigationService,
      translate,
      changeDetectorRef
    );
  }
 }
