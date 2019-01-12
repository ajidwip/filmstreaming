import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { AdMobPro } from '@ionic-native/admob-pro';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import moment from 'moment';
import { HttpHeaders } from "@angular/common/http";

declare var ExoPlayer: any;
declare var window: any;

@IonicPage()
@Component({
  selector: 'page-preview',
  templateUrl: 'preview.html',
})
export class PreviewPage {

  public trailer: any;
  public channeldetail: any;
  public genres = [];
  public channels = [];
  public listserver = [];
  public query: any;
  public load = '';
  public report = [];
  public inifavorit = [];
  public nextno: any;
  public overlay = false

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public toastCtrl: ToastController,
    private uniqueDeviceID: UniqueDeviceID,
    private youtube: YoutubeVideoPlayer,
    public alertCtrl: AlertController,
    public admob: AdMobPro) {
    this.channeldetail = this.navParams.get('channeldetail')
    let trailersubs = this.channeldetail.trailer.substring(32, 60)
    this.trailer = trailersubs
    var array = this.channeldetail.imdb_genre.split(", ");
    this.genres = array
    var query = [];
    for (let i = 0; i < this.genres.length; i++) {
      if (i == 0) {
        query.push(" AND imdb_genre LIKE '%" + this.genres[i] + "%'")
      }
      else {
        query.push(" OR imdb_genre LIKE '%" + this.genres[i] + "%'")
      }
    }
    this.query = query.toString()
    for (let i = 0; i < this.genres.length; i++) {
      this.query = this.query.replace(',', '')
    }
    this.doGetRecommended()
    this.doGetServer()
    this.api.get("table/z_report_url", { params: { limit: 30, filter: "id_channel=" + "'" + this.channeldetail.id + "' AND (name LIKE '%Film%' OR name LIKE '%Anime%')" } })
      .subscribe(val => {
        this.report = val['data']
      });
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        this.api.get("table/z_arsip_users", { params: { limit: 30, filter: "id=" + "'" + this.channeldetail.id + "' AND uuid_device=" + "'" + uuid + "'" } })
          .subscribe(val => {
            this.inifavorit = val['data']
          });
      }, (err) => {
      })
      .catch((error: any) => console.log(error));
  }
  doBack() {
    this.navCtrl.pop()
  }
  doGetRecommended() {
    this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN'" + this.query, limit: 10, sort: "newid()" } })
      .subscribe(val => {
        this.channels = val['data']
        this.load = 'OK'
      }, err => {
        this.doGetRecommended()
      });
  }
  doGetServer() {
    this.api.get("table/z_channel_stream_url", { params: { filter: "status='OPEN' AND id_channel=" + "'" + this.channeldetail.id + "'", limit: 10, sort: "quality" + " ASC " } })
      .subscribe(val => {
        this.listserver = val['data']
      }, err => {
        this.doGetServer()
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
  doPlay(server) {
    this.api.get("table/z_channel_stream", { params: { limit: 1, filter: "id=" + "'" + server.id + "'" } })
      .subscribe(val => {
        let data = val['data']
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.put("table/z_channel_stream",
          {
            "id": server.id,
            "click": data[0].click + 1
          },
          { headers })
          .subscribe(val => {
          });
      });
    if (server.name == 'Anime' || server.name == 'Film Series') {
      this.navCtrl.push('ChanneldetailPage', {
        anime: server.title
      })
    }
    else {
      if (server.stream != '0') {
        this.navCtrl.push('PlayerPage', {
          url: server.url,
          stream: server.stream,
          xml: server.xml,
          rotate: server.orientation,
          thumbnail: server.thumbnail_picture
        })
      }
      else if (server.stream == '0' && server.plugin == '1') {
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
        this.doPlayExo(server)
      }
    }
  }
  doGetPlay() {
    this.on()
  }
  on() {
    //document.getElementById("overlay").style.display = "block";
    this.overlay = true;
  }

  off() {
    //document.getElementById("overlay").style.display = "none";
    this.overlay = false;
  }
  doTrailer() {
    this.youtube.openVideo(this.trailer);
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
  doPreview(channeldetail) {
    this.navCtrl.push('PreviewPage', {
      channeldetail: channeldetail
    })
  }
  getNextNoArsip() {
    return this.api.get('nextno/z_arsip_users/id_device')
  }
  doBookmark() {
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        let date = moment().format('YYYY-MM-DD HH:mm');
        if (this.inifavorit.length != 0) {
          const headers = new HttpHeaders()
            .set("Content-Type", "application/json");
          this.api.delete("table/z_arsip_users", { params: { filter: "id_device=" + "'" + this.inifavorit[0].id_device + "'" }, headers })
            .subscribe(val => {
              this.inifavorit = [];
              this.api.get("table/z_arsip_users", { params: { limit: 30, filter: "id=" + "'" + this.channeldetail.id + "' AND uuid_device=" + "'" + uuid + "'" } })
                .subscribe(val => {
                  this.inifavorit = val['data']
                });
            });
        }
        else {
          this.api.get("table/z_channel_stream", { params: { limit: 30, filter: "id=" + "'" + this.channeldetail.id + "'" } })
            .subscribe(val => {
              let data = val['data']
              this.getNextNoArsip().subscribe(val => {
                this.nextno = val['nextno'];
                const headers = new HttpHeaders()
                  .set("Content-Type", "application/json");
                this.api.post("table/z_arsip_users",
                  {
                    "id_device": this.nextno,
                    "uuid_device": uuid,
                    "type_arsip": 'fav',
                    "id": data[0].id,
                    "name": data[0].name,
                    "stream": data[0].stream,
                    "category": data[0].category,
                    "type": data[0].type,
                    "controls": data[0].controls,
                    "xml": data[0].xml,
                    "plugin": data[0].plugin,
                    "title": data[0].title,
                    "thumbnail_picture": data[0].thumbnail_picture,
                    "trailer": data[0].trailer,
                    "url": data[0].url,
                    "date": date
                  },
                  { headers })
                  .subscribe(val => {
                    this.inifavorit = [];
                    this.api.get("table/z_arsip_users", { params: { limit: 30, filter: "id=" + "'" + this.channeldetail.id + "' AND uuid_device=" + "'" + uuid + "'" } })
                      .subscribe(val => {
                        this.inifavorit = val['data']
                      });
                  }, (err) => {

                  })
              });
            });
        }
      })
      .catch((error: any) => console.log(error));
  }
  doReport() {
    this.api.get("table/z_report_url", { params: { limit: 30, filter: "id_channel=" + "'" + this.channeldetail.id + "' AND (name LIKE '%Film%' OR name LIKE '%Anime%')" } })
      .subscribe(val => {
        let data = val['data']
        if (data.length != 0) {
          let alert = this.alertCtrl.create({
            subTitle: 'URL ini dilaporkan tidak aktif oleh seseorang dan sedang dalam pengecekan admin',
            buttons: ['OK']
          });
          alert.present();
        }
        else {
          let alert = this.alertCtrl.create({
            title: 'Konfirmasi Laporan',
            message: 'Apakah anda yakin URL ini tidak aktif?',
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: () => {

                }
              },
              {
                text: 'Yes',
                handler: () => {
                  this.api.get("table/z_channel_stream", { params: { limit: 30, filter: "id=" + "'" + this.channeldetail.id + "'" } })
                    .subscribe(val => {
                      let data = val['data']
                      this.api.get('nextno/z_report_url/id').subscribe(val => {
                        let nextno = val['nextno'];
                        const headers = new HttpHeaders()
                          .set("Content-Type", "application/json");
                        this.api.post("table/z_report_url",
                          {
                            "id": nextno,
                            "id_channel": data[0].id,
                            "name": data[0].name,
                            "title": data[0].title,
                            "url": data[0].url,
                            "date": moment().format('YYYY-MM-DD HH:mm:ss'),
                          },
                          { headers })
                          .subscribe(val => {
                            let toast = this.toastCtrl.create({
                              message: 'Report has been sent',
                              duration: 3000
                            });
                            toast.present();
                            this.report = [];
                            this.api.get("table/z_report_url", { params: { limit: 30, filter: "id_channel=" + "'" + this.channeldetail.id + "' AND (name LIKE '%Film%' OR name LIKE '%Anime%')" } })
                              .subscribe(val => {
                                this.report = val['data']
                              });
                          });
                      });
                    });
                }
              }
            ]
          });
          alert.present();
        }
      });
  }
}
