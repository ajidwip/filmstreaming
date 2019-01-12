import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { AdMobPro } from '@ionic-native/admob-pro';

@IonicPage()
@Component({
  selector: 'page-detailcategory',
  templateUrl: 'detailcategory.html',
})
export class DetailcategoryPage {

  public genre: any;
  public channels = [];
  halaman = 0;
  public load: any;
  public showsearch: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public admob: AdMobPro
  ) {
    this.genre = this.navParams.get('genre')
    this.doGetChannels()
  }
  doGetChannels() {
    return new Promise(resolve => {
      let offset = 20 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("table/z_channel_stream", { params: { offset: offset, filter: "status='OPEN' AND imdb_genre LIKE '%" + this.genre + "%'", limit: 30, sort: "title" + " ASC " } })
          .subscribe(val => {
            let data = val['data']
            for (let i = 0; i < data.length; i++) {
              this.channels.push(data[i]);
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            setTimeout(() => {
              this.load = 'OK'
            }, 2000)
            resolve(val)
          }, err => {
            this.doGetChannels()
          });
      }
    }, );
  }
  doInfinite(infiniteScroll) {
    this.doGetChannels().then(response => {
      infiniteScroll.complete();
    });
  }
  doShowSearch() {
    this.showsearch = this.showsearch ? false : true
  }
  doHideSearch() {
    this.showsearch = this.showsearch ? false : true
  }
  getSearch(ev: any) {
    // set val to the value of the searchbar
    let value = ev.target.value;
    // if the value is an empty string don't filter the items
    if (value && value.trim() != '') {
      this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN' AND title LIKE '%" + value + "%' AND imdb_genre LIKE '%" + this.genre + "%'", limit: 30, sort: "title" + " ASC " } })
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
      this.doGetChannels();
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
