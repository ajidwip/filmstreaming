import { Component } from '@angular/core';
import { App, LoadingController, NavController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ApiProvider } from '../../providers/api/api';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { HttpHeaders } from "@angular/common/http";

declare var ExoPlayer;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public loader: any;
  public channels = [];
  public channellistall = [];
  halaman = 0;
  public load: any;
  public nextno: any;
  public favorit = [];
  public mostwatch = [];

  constructor(
    public navCtrl: NavController,
    public api: ApiProvider,
    public app: App,
    private uniqueDeviceID: UniqueDeviceID,
    public loadingCtrl: LoadingController,
    private screenOrientation: ScreenOrientation) {
    this.uniqueDeviceID.get()
      .then((uuid: any) => {
        this.api.get("table/z_devices", { params: { limit: 100, filter: "uuid_device=" + "'" + uuid + "'" } })
          .subscribe(val => {
            let data = val['data']
            if (data.length == 0) {
              this.getNextNoDevices().subscribe(val => {
                this.nextno = val['nextno'];
                const headers = new HttpHeaders()
                  .set("Content-Type", "application/json");
                this.api.post("table/z_devices",
                  {
                    "id": this.nextno,
                    "uuid_device": uuid
                  },
                  { headers })
                  .subscribe(val => {
                  }, (err) => {

                  })
              });
            }
            else {
              this.favorit = [];
              this.api.get("table/z_arsip_users", { params: { limit: 1000, filter: "uuid_device=" + "'" + uuid + "' AND type_arsip='fav'", sort: "date" + " DESC " } })
                .subscribe(val => {
                  let favorit = val['data']
                  for (let i = 0; i < favorit.length; i++) {
                    this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN' AND id=" + "'" + favorit[i].id + "'", limit: 8, sort: "click" + " DESC " } })
                      .subscribe(val => {
                        this.favorit.push(favorit[i])
                      });
                  }
                  console.log(this.favorit)
                });
            }
          });
      })
      .catch((error: any) => console.log(error));
    this.load = ''
    this.loader = this.loadingCtrl.create({
      // cssClass: 'transparent',
    });
    this.loader.present().then(() => {
      this.doGetList()
      this.mostwatch = [];
      this.doGetMostWatched();
    });
  }
  doGetMostWatched() {
    this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN'", limit: 8, sort: "click" + " DESC " } })
      .subscribe(val => {
        let data = val['data']
        for (let i = 0; i < data.length; i++) {
          this.mostwatch.push(data[i]);
        }
      }, err => {
        this.doGetMostWatched();
      });
  }
  getNextNoDevices() {
    return this.api.get('nextno/z_devices/id')
  }
  doGetList() {
    return new Promise(resolve => {
      let offset = 5 * this.halaman
      if (this.halaman == -1) {
        resolve();
      }
      else {
        this.halaman++;
        this.api.get("table/z_list_channel", { params: { filter: "status='OPEN' AND category='STREAM'", offset: offset, limit: 5, sort: "name" + " ASC " } })
          .subscribe(val => {
            let data = val['data']
            for (let i = 0; i < data.length; i++) {
              this.channellistall.push(data[i]);
              this.api.get("table/z_channel_stream", { params: { filter: "status='OPEN' AND name=" + "'" + data[i].name + "'", limit: 10, sort: "date" + " DESC " } })
                .subscribe(val => {
                  let data = val['data']
                  for (let i = 0; i < data.length; i++) {
                    this.channels.push(data[i]);
                  }
                });
            }
            if (data.length == 0) {
              this.halaman = -1
            }
            setTimeout(() => {
              this.load = 'OK'
            }, 2000)
            resolve(val)
          }, err => {
            this.doGetList();
          });
      }
    });
  }
  ngAfterViewInit() {
    this.loader.dismiss()
  }
  doInfinite(infiniteScroll) {
    this.doGetList().then(response => {
      infiniteScroll.complete();
    });
  }
  doPreview(channeldetail) {
    this.navCtrl.push('PreviewPage', {
      channeldetail: channeldetail
    })
  }
  doPage(val) {
    this.navCtrl.push(val)
  }
  doRootPage() {
    this.app.getRootNav().setRoot(HomePage)
  }
  doDetail(channel) {
    this.navCtrl.push('DetailPage', {
      channel: channel
    })
  }
  doRate() {
    this.api.get("table/z_version", { params: { filter: "name=" + "'com.filmstreaming.ometubetv'" } })
      .subscribe(val => {
        let data = val['data']
        window.location.href = data[0].url
      });
  }
}
