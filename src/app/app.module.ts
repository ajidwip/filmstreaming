import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AdMobPro } from '@ionic-native/admob-pro';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { ApiProvider } from '../providers/api/api';
import { HttpClientModule } from '@angular/common/http';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { SafePipe } from '../pipes/safe/safe';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AdMobPro,
    ScreenOrientation,
    YoutubeVideoPlayer,
    ApiProvider,
    AndroidFullScreen,
    UniqueDeviceID
  ]
})
export class AppModule {}
