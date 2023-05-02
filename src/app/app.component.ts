import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SessionService } from './youtubeauto/service/user/session.service';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  title = 'TubeMate';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private translate: TranslateService,
    private sessionService: SessionService
  ) {
    console.log("🚀 ~ file: app.component.ts:22 ~ AppComponent ~ translate:", translate)
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
    this.translate.onLangChange.subscribe(() => {
      this.sessionService.storeLanguagePref(this.translate.currentLang)
    });
    this.updateInitLanguage();
  }

  private updateInitLanguage() {
    const defaultLang = this.sessionService.getLanguagePref() ?? 'en';
    this.translate.addLangs(['en', 'fr']);
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
  }
}
