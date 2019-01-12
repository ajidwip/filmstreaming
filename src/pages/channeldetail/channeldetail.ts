import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Refresher, Platform, LoadingController, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AdMobPro } from '@ionic-native/admob-pro';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { HttpHeaders } from "@angular/common/http";

declare var ExoPlayer: any;
declare var window: any;

@IonicPage()
@Component({
  selector: 'page-channeldetail',
  templateUrl: 'channeldetail.html',
})
export class ChanneldetailPage {
  public anime: any;
  public channeldetail = [];
  halaman = 0;
  public loader: any;
  public packagename: any;
  public ads: any;
  public showsearch: boolean = false;
  public search = [];
  public quality = [];
  public qualityid: any;
  public row: any;

  constructor(
    public navCtrl: NavController,
    private screenOrientation: ScreenOrientation,
    public platform: Platform,
    public navParams: NavParams,
    public admob: AdMobPro,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private androidFullScreen: AndroidFullScreen,
    public api: ApiProvider) {
    this.anime = this.navParams.get('anime')
    this.loader = this.loadingCtrl.create({

    });
    this.loader.present().then(() => {
      this.doGetChannelDetail();
      this.doGetSearch();
    });
  }
  doShowSearch() {
    this.showsearch = this.showsearch ? false : true
  }
  doHideSearch() {
    this.showsearch = this.showsearch ? false : true
  }
  doGetChannelDetail() {
    return new Promise(resolve => {
      let offset = 30 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get('table/z_channel_stream_detail', { params: { limit: 30, offset: offset, filter: "name=" + "'" + this.anime + "' AND status='OPEN'", sort: "episode" + " DESC " } })
          .subscribe(val => {
            let data = val['data'];
            for (let i = 0; i < data.length; i++) {
              this.channeldetail.push(data[i]);
            }
            this.loader.dismiss();
            if (data.length == 0) {
              this.halaman = -1
            }
            resolve();
          });
      }
    })

  }
  doGetSearch() {
    this.api.get("table/z_channel_stream_detail", { params: { limit: 10000, filter: "name=" + "'" + this.anime + "' AND status='OPEN'", sort: "episode" + " DESC " } })
      .subscribe(val => {
        this.search = val['data']
      });
  }
  getSearch(ev: any) {
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.channeldetail = this.search.filter(eps => {
        return eps.episode.toLowerCase().indexOf(val.toLowerCase()) > -1;
      })
    } else {
      this.channeldetail = [];
      this.halaman = 0;
      this.doGetChannelDetail();
    }
  }
  doInfinite(infiniteScroll) {
    this.doGetChannelDetail().then(response => {
      infiniteScroll.complete();

    })
  }
  doRefresh(refresher) {
    this.doGetChannelDetail().then(response => {
      refresher.complete();
    })
  }
  goToPlayAnime(channel) {
    this.api.get("table/z_channel_stream_detail", { params: { limit: 1, filter: "id=" + "'" + channel.id + "'" } })
      .subscribe(val => {
        let data = val['data']
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.put("table/z_channel_stream_detail",
          {
            "id": channel.id,
            "click": data[0].click + 1
          },
          { headers })
          .subscribe(val => {
          });
      });
    this.navCtrl.push('PlayerPage', {
      name: channel.name,
      episode: channel.episode,
      url: channel.url,
      type: channel.type,
      stream: channel.stream,
      xml: channel.xml,
      thumbnail: channel.thumbnail_picture
    })
  }
  ionViewDidLoad() {
  }
  ionViewDidEnter() {
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.showSystemUI())
      .catch(err => console.log(err));
    this.api.get("table/z_admob", { params: { limit: 100, filter: "appid=" + "'com.filmstreaming.ometubetv' AND status='OPEN'" } })
      .subscribe(val => {
        this.ads = val['data']
        var admobid = {
          banner: this.ads[0].ads_banner,
          interstitial: this.ads[0].ads_interstitial
        };

        this.admob.createBanner({
          adSize: 'SMART_BANNER',
          adId: admobid.banner,
          isTesting: this.ads[0].testing,
          autoShow: true,
          position: this.admob.AD_POSITION.BOTTOM_CENTER,
        });
      });
    if (this.platform.is('cordova')) {
      //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    }
  }
  ionViewWillLeave() {
    this.admob.removeBanner();
  }
  doCloseQuality() {
    document.getElementById('qualitya').style.display = 'none';
  }
  doSelectQuality() {

  }
  doQuality(channel) {
    this.row = channel.Row
    this.qualityid = ''
    this.api.get("table/z_channel_stream_detail_url", { params: { limit: 10, filter: "id_channel=" + "'" + channel.id + "'" + "AND status = 'OPEN'", sort: 'quality ASC' } })
      .subscribe(val => {
        this.quality = val['data']
        document.getElementById('qualitya').style.display = 'block';
      });
  }
  doPlayStreaming(server) {
    var videoUrl = server.url;
    var options = {
      successCallback: function () {

      },
      errorCallback: function (errMsg) {
        let toast = this.toastCtrl.create({
          message: errMsg,
          duration: 3000
        });
        toast.present();
      },
      orientation: 'landscape',
      shouldAutoClose: true,  // true(default)/false
      controls: false // true(default)/false. Used to hide controls on fullscreen
    };
    window.plugins.streamingMedia.playVideo(videoUrl, options);
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
  doPlayExo(server) {
    var self = this;
    var successCallback = function (res) {
      if (res.eventType == 'KEY_EVENT') {
        ExoPlayer.close();
      }
      if (res.eventType == 'TOUCH_EVENT') {
        ExoPlayer.showController()
      }

    };

    var errorCallback = function (error) {
      ExoPlayer.close();
      self.doPlayStreaming(server)
    };
    if (server.type == 'STREAM') {
      ExoPlayer.show({
        url: server.url,
        aspectRatio: 'FILL_SCREEN',
        showBuffering: true,
        retryCount: 2,
        controller: {
          hidePosition: false,
          hideDuration: false,
          controlIcons: {
            'exo_rew': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/rewind-icon-18-256.png',
            'exo_play': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/play-icon-18-256.png',
            'exo_pause': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/pause-icon-18-256.png',
            'exo_ffwd': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/fast-forward-icon-18-256.png'
            //'exo_ffwd': null, // Buttons not included in configuration will show up as default ExoPlayer buttons
          },
          textColor: '#ffffff', // These colors can be any valid Android color
          buttonsColor: '#ffffff', // This example uses hex values including alpha (first byte)
          bufferingColor: '#ffffff' // Alpha of 'ff' makes it 100% opaque
        }
      }, successCallback, errorCallback);
    }
    else {
      ExoPlayer.show({
        url: server.url,
        aspectRatio: 'FILL_SCREEN',
        showBuffering: true,
        retryCount: 2,
        /*controller: {
          hidePosition: false,
          hideDuration: false,
          controlIcons: {
            'exo_rew': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/rewind-icon-18-256.png',
            'exo_play': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/play-icon-18-256.png',
            'exo_pause': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/pause-icon-18-256.png',
            'exo_ffwd': 'https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/fast-forward-icon-18-256.png'
            //'exo_ffwd': null, // Buttons not included in configuration will show up as default ExoPlayer buttons
          },*/
        textColor: '#ffffff', // These colors can be any valid Android color
        buttonsColor: '#ffffff', // This example uses hex values including alpha (first byte)
        bufferingColor: '#ffffff' // Alpha of 'ff' makes it 100% opaque
        //}
      }, successCallback, errorCallback);
    }
  }
  doPlayer() {
    if (this.qualityid === '') {
      let alert = this.alertCtrl.create({
        subTitle: 'Silahkan pilih server terlebih dahulu !!!',
        buttons: ['OK']
      });
      alert.present();
    }
    else {
      this.doCloseQuality()
      this.api.get("table/z_channel_stream_detail_url", { params: { limit: 1, filter: "id=" + "'" + this.qualityid + "'" } })
        .subscribe(val => {
          let data = val['data']
          let server = data
          if (data[0].stream == '0') {
            this.doPlayExo(server)
          }
          else {
            this.navCtrl.push('PlayerPage', {
              name: data[0].name,
              row: this.row,
              url: data[0].url,
              episode: data[0].episode,
              type: data[0].type,
              stream: data[0].stream,
              xml: data[0].xml,
              thumbnail: data[0].thumbnail_picture
            })
          }
        });
    }
  }

}
