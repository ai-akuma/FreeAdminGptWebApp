import { Component, EventEmitter, OnInit, Output } from '@angular/core';

interface DropdownItem {
  id: number;
  name: string;
  description: string;
  audioUrl: string;
}

@Component({
  selector: 'audio-dropdown',
  templateUrl: './audiodropdown.component.html',
  styleUrls: ['./audiodropdown.component.scss'],
})
export class AudioDropdownComponent implements OnInit {
  @Output() voiceSelected = new EventEmitter<{ name: string; sampleUrl: string }>();

  isOpen = false;
  selectedItem: { name: string; sampleUrl: string };
  voiceOptions: { name: string; sampleUrl: string }[] = [];

  constructor() {
    /** */
  }

  ngOnInit() {
    // Set the default selected item
    this.selectedItem = {
      name: 'Select a voice',
      sampleUrl: 'https://www.youtube.com/watch?v=QH2-TGUlwu4',
    };
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onItemSelect(event: Event, item: { name: string; sampleUrl: string }) {
    event.preventDefault();
    event.stopPropagation();

    this.selectedItem = item;
    this.isOpen = false;
    this.voiceSelected.emit(item);

    // this.mediaFormGroup.patchValue({
    //     selectedVoice: item.sampleUrl,
    // });
  }

  onItemPlay(audioPlayer: HTMLAudioElement) {
    audioPlayer.play();
  }

  populateList(response: { name: string; sampleUrl: string }[]) {
    this.voiceOptions = response;
  }
}