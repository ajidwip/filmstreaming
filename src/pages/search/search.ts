import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AdMobPro } from '@ionic-native/admob-pro';


@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  public channels = [];
  halaman = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public admob: AdMobPro) {
  }
  getSearch(ev: any) {
    // set val to the value of the searchbar
    let value = ev.target.value;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN' AND title LIKE '%" + value + "%'", limit: 30, sort: "title" + " ASC " } })
        .subscribe(val => {
          let data = val['data']
          this.channels = data.filter(channel => {
            return channel.title.toLowerCase().indexOf(value.toLowerCase()) > -1;
          })
        });
    }
    else {
      this.channels = [];
      this.halaman = 0;
    }
  }
  doPreview(channeldetail) {
    this.navCtrl.push('PreviewPage', {
      channeldetail: channeldetail
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
