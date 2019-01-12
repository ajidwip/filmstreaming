import { ViewChild, Component } from '@angular/core';
import { MenuController, NavController, Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpHeaders } from "@angular/common/http";
import { HomePage } from '../pages/home/home';
import { ApiProvider } from '../providers/api/api';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('mycontent') Nav: NavController;
  rootPage: any = HomePage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public menuCtrl: MenuController,
    public api: ApiProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
  doPage(val) {
    this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN' AND name=" + "'" + val + "'", limit: 1, sort: "title" + " ASC " } })
      .subscribe(val => {
        let data = val['data']
        console.log(data)
        this.Nav.push('DetailPage', {
          channel: data[0]
        })
      });
    this.menuCtrl.close();
  }
  doGenre(val) {
    this.Nav.push('DetailcategoryPage', {
      genre: val
    })
    this.menuCtrl.close();
  }
  doComment() {
    this.Nav.push('CommentPage', {
      param: '0'
    })
    this.menuCtrl.close();
  }
  doRequest() {
    this.Nav.push('CommentPage', {
      param: '1'
    })
    this.menuCtrl.close();
  }
}

