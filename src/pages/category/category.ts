import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AdMobPro } from '@ionic-native/admob-pro';

@IonicPage()
@Component({
  selector: 'page-category',
  templateUrl: 'category.html',
})
export class CategoryPage {

  public categorylist = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public admob: AdMobPro) {
    this.api.get("table/z_genres", { params: { limit: 100, sort: "name" + " ASC " } })
      .subscribe(val => {
        this.categorylist = val['data']
      });
  }
  doGenre(val) {
    this.navCtrl.push('DetailcategoryPage', {
      genre: val
    })
  }
  ionViewDidEnter() {
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
    this.admob.removeBanner();
  }

}
