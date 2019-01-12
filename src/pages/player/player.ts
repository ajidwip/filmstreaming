import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AdMobPro } from '@ionic-native/admob-pro';
import { ApiProvider } from '../../providers/api/api';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

@IonicPage()
@Component({
  selector: 'page-player',
  templateUrl: 'player.html',
})
export class PlayerPage {

  public url = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public admob: AdMobPro,
    private androidFullScreen: AndroidFullScreen,
    public api: ApiProvider) {
    this.url = this.navParams.get('url')
    }
  ionViewDidEnter() {
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.immersiveMode())
      .catch(err => console.log(err));
    this.api.get("table/z_admob", { params: { limit: 100, filter: "appid=" + "'com.filmstreaming.ometubetv' AND status='OPEN'" } })
      .subscribe(val => {
        let ads = val['data']
        var admobid = {
          banner: ads[0].ads_banner,
          interstitial: ads[0].ads_interstitial
        };

        this.admob.prepareInterstitial({
          adId: admobid.interstitial,
          isTesting: ads[0].testing,
          autoShow: true
        })
      });
  }
  ionViewWillLeave() {
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.showSystemUI())
      .catch(err => console.log(err));
  }
}
